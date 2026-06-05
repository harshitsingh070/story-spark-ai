import React, { useEffect, useState, useRef, useMemo } from "react";
import DOMPurify from "dompurify";
import { getShortenedText, ITopicData, topicsData, getWordCount, SELECTED_TOPIC_CLASSES } from "./stories.utils";
import { formatReadingStats } from "../../utils/story-utils";
import toast, { Toaster } from "react-hot-toast";
import { useCreatePostMutation, useDeletePostMutation } from "../../redux/apis/post.api";
import { useGetProfileInfoQuery } from "../../redux/apis/user.api";
import jsPDF from "jspdf";
import JSZip from "jszip";
import StoryWorldMap from "../story-map/StoryWorldMap";
import StoryRemix from "../remix/StoryRemix";
import BookmarkButton from "../BookmarkButton";
import logo from "../../assets/logoNew.png";
import StoryGeneratingAnimation from "../loading/story-generating-animation.component";
import AudioPlayer, { type AudioPlayerHandle, type NarrationPlaybackState } from "../AudioPlayer";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useGenerateAlternateEndingsMutation,
  useGenerateFreeAlternateEndingsMutation,
} from "../../redux/apis/ai.model.api";
import ImageFallback from "../ImageFallback";
import GeneratedStoryTimeline from "./GeneratedStoryTimeline";

// --- Custom Error Classes & Helper Types ---
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return "The AI service is currently busy. Please wait a moment and try again.";
    }
    if ([502, 503, 504].includes(error.status)) {
      return "The server took too long to respond. Please try again shortly.";
    }
    if (error.status >= 500) {
      return "A server error occurred. Please try again later.";
    }
  }
  if (error instanceof TypeError) {
    return "Could not reach the server. Please check your connection and try again.";
  }
  return "An unexpected error occurred. Please try again.";
}

// Dummy themes helper (Ensure it works or adjust imports)
const getGenreTheme = (tag: string) => {
  return { gradient: "45deg, #1e1b4b, #311042", accent: "#a855f7", icon: "✨" };
};
const getInitials = (title: string) => title.slice(0, 2).toUpperCase();

interface StoryCoverImageProps {
  title?: string;
  tag?: string;
  size?: "thumb" | "full";
  className?: string;
  style?: React.CSSProperties;
}

const StoryCoverImage: React.FC<StoryCoverImageProps> = ({
  title = "",
  tag = "default",
  size = "full",
  className = "",
  style = {},
}) => {
  const theme = getGenreTheme(tag);
  const initials = getInitials(title);

  if (size === "thumb") {
    return (
      <div
        className={className}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `linear-gradient(${theme.gradient})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.05em",
          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          userSelect: "none",
          ...style,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "192px",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(${theme.gradient})`,
        borderRadius: "inherit",
        ...style,
      }}
    >
      <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "60%", height: "120%", background: "rgba(255,255,255,0.08)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "45%", height: "80%", background: "rgba(0,0,0,0.12)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "12px", right: "16px", fontSize: "3.5rem", color: theme.accent, opacity: 0.35, lineHeight: 1, userSelect: "none", pointerEvents: "none", fontWeight: 300 }}>{theme.icon}</div>
      <div style={{ position: "absolute", top: "14px", left: "14px", background: "rgba(0,0,0,0.28)", backdropFilter: "blur(6px)", color: "#fff", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "999px", border: `1px solid ${theme.accent}55`, userSelect: "none" }}>{tag}</div>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "5rem", fontWeight: 900, color: "rgba(255,255,255,0.12)", letterSpacing: "-0.04em", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>{initials}</div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)", padding: "32px 14px 12px" }}>
        <p style={{ margin: 0, color: "#fff", fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.3, textShadow: "0 1px 6px rgba(0,0,0,0.5)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title}</p>
      </div>
    </div>
  );
};

export interface IStories {
  uuid: string;
  title: string;
  content: string;
  tag: string;
  imageURL: string;
  language?: string;
}

interface IPost extends IStories {
  topic: ITopicData[];
  isPublished?: boolean;
}

interface StoriesComponentProps {
  stories: IStories[];
  isLogin: boolean;
  setStories: (stories: IStories[]) => void;
  onPublishSuccess?: () => void;
}

interface IRelatedStoriesComponentProps {
  posts: { _id: string; title: string; [key: string]: unknown }[];
  currentPostId: string;
}

type StorySentenceSegment = {
  id: string;
  text: string;
  startWordIndex: number;
  endWordIndex: number;
};

const buildSentenceSegments = (content: string): StorySentenceSegment[] => {
  if (!content.trim()) return [];
  const sentenceMatches = content.match(/[^.!?]+[.!?]*\s*/g) ?? [content];
  const segments: StorySentenceSegment[] = [];
  let wordCursor = 0;

  sentenceMatches.forEach((sentence, index) => {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) return;
    const wordsInSentence = sentence.match(/\S+/g)?.length ?? 0;
    const startWordIndex = wordCursor;
    const endWordIndex = wordsInSentence > 0 ? wordCursor + wordsInSentence - 1 : wordCursor;

    segments.push({
      id: `${index}-${startWordIndex}-${endWordIndex}`,
      text: sentence,
      startWordIndex,
      endWordIndex,
    });
    wordCursor += wordsInSentence;
  });
  return segments;
};

export const RelatedStoriesComponent: React.FC<IRelatedStoriesComponentProps> = ({ posts, currentPostId }) => {
  const navigate = useNavigate();
  const filteredPosts = posts.filter((post) => post._id !== currentPostId);

  return (
    <div className="mt-8">
      <h4 className="text-lg font-bold text-slate-200 mb-4">Related Content</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPosts.map((post) => (
          <div
            key={post._id}
            onClick={() => navigate(`/stories/${post._id}`)}
            className="p-4 bg-slate-700/40 rounded-xl border border-slate-600/30 cursor-pointer hover:bg-slate-700/60 transition-colors"
          >
            <p className="text-sm font-semibold text-white truncate">{post.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const StoriesViewComponent: React.FC<StoriesComponentProps> = ({
  stories,
  isLogin,
  setStories,
}) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);

  // Error handling states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Standard functional states
  const [selectedStory, setSelectedStory] = useState<IStories | null>(null);
  const [topics, setTopics] = useState<ITopicData[]>(topicsData);
  const [selectTopics, setSelectTopics] = useState<ITopicData[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const [createPost] = useCreatePostMutation();
  const [deletePost] = useDeletePostMutation();
  const { data: profile } = useGetProfileInfoQuery(undefined, { skip: !isLogin });
  
  const lastSavedContentRef = useRef<string>("");
  const isSavingRef = useRef<boolean>(false);
  const hasSavedSessionRef = useRef<boolean>(false);
  const savedPostIdRef = useRef<string | null>(null);

  const [isGeneratingEndings, setIsGeneratingEndings] = useState<boolean>(false);
  const [endingsCache, setEndingsCache] = useState<{
    [uuid: string]: { style: string; ending: string; fullStory: string }[];
  }>({});
  const [originalStoryContent, setOriginalStoryContent] = useState<{ [uuid: string]: string }>({});

  const [narrationWordIndex, setNarrationWordIndex] = useState<number>(0);
  const [narrationState, setNarrationState] = useState<NarrationPlaybackState>("idle");

  const [generateAlternateEndings] = useGenerateAlternateEndingsMutation();
  const [generateFreeAlternateEndings] = useGenerateFreeAlternateEndingsMutation();

  useEffect(() => {
    if (selectedStory && !originalStoryContent[selectedStory.uuid]) {
      setOriginalStoryContent((prev) => ({
        ...prev,
        [selectedStory.uuid]: selectedStory.content,
      }));
    }
  }, [selectedStory, originalStoryContent]);

  useEffect(() => {
    setSelectTopics(topics.filter((topic) => topic.selected));
  }, [topics]);

  useEffect(() => {
    setNarrationWordIndex(0);
    setNarrationState("idle");
    setErrorMessage(null); // Clear errors when switching stories
  }, [selectedStory?.uuid]);

  const sentenceSegments = useMemo(() => {
    return buildSentenceSegments(selectedStory?.content ?? "");
  }, [selectedStory?.content]);

  useEffect(() => {
    if (stories && stories.length > 0) {
      setSelectedStory(stories[0]);
    } else {
      setSelectedStory(null);
    }
    lastSavedContentRef.current = "";
    hasSavedSessionRef.current = false;
    savedPostIdRef.current = null;
  }, [stories]);

  const getSafeFileName = (title: string, ext: string) => {
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${safeTitle}.${ext}`;
  };

  const handleExportPDF = () => {
    if (!selectedStory) { toast.error("No story available to export."); return; }
    if (!selectedStory.content?.trim()) { toast.error("Story content is empty. Cannot export."); return; }
    try {
      const doc = new jsPDF();
      const title = selectedStory.title || "Untitled Story";
      const content = selectedStory.content || "";
      const author = isLogin && profile?.name ? profile.name : "Anonymous";

      doc.setFontSize(20);
      doc.text(title, 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Author: ${author}`, 20, 30);
      
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(content, 170);
      let y = 40;
      for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(splitText[i], 20, y);
        y += 6;
      }
      doc.save(getSafeFileName(title, "pdf"));
      toast.success("PDF downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export PDF.");
    }
  };

  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const handleExportEPUB = async () => {
    if (!selectedStory) { toast.error("No story available to export."); return; }
    if (!selectedStory.content?.trim()) { toast.error("Story content is empty. Cannot export."); return; }
    const toastId = toast.loading("Generating your EPUB...");
    try {
      const zip = new JSZip();
      const title = escapeXml(selectedStory.title || "Story");
      const content = selectedStory.content || "";
      const author = escapeXml(isLogin && profile?.name ? profile.name : "Anonymous");
      const uuid = escapeXml(selectedStory.uuid || crypto.randomUUID());

      zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
      zip.folder("META-INF")?.file("container.xml", 
        `<?xml version="1.0"?>
        <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
          <rootfiles>
            <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
          </rootfiles>
        </container>`);

      zip.folder("OEBPS")?.file("content.opf", 
        `<?xml version="1.0" encoding="UTF-8"?>
        <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">
          <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
            <dc:title>${title}</dc:title>
            <dc:creator opf:role="aut">${author}</dc:creator>
            <dc:language>en</dc:language>
            <dc:identifier id="BookID">urn:uuid:${uuid}</dc:identifier>
          </metadata>
          <manifest>
            <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
            <item id="content" href="content.html" media-type="application/xhtml+xml"/>
          </manifest>
          <spine toc="ncx">
            <itemref idref="content"/>
          </spine>
        </package>`);

      zip.folder("OEBPS")?.file("toc.ncx", 
        `<?xml version="1.0" encoding="UTF-8"?>
        <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
          <head><meta name="dtb:uid" content="urn:uuid:${uuid}"/><meta name="dtb:depth" content="1"/></head>
          <docTitle><text>${title}</text></docTitle>
          <navMap><navPoint id="navpoint-1" playOrder="1"><navLabel><text>Start Reading</text></navLabel><content src="content.html"/></navPoint></navMap>
        </ncx>`);

      const htmlBody = content.split('\n').filter(p => p.trim()).map(p => `<p>${escapeXml(p.trim())}</p>`).join('\n');
      zip.folder("OEBPS")?.file("content.html", 
        `<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
          <head><title>${title}</title><style>body { font-family: serif; padding: 20px; line-height: 1.5; } h1 { text-align: center; color: #333; } p { margin-bottom: 1em; text-indent: 1em; }</style></head>
          <body><h1>${title}</h1>${htmlBody}</body>
        </html>`);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getSafeFileName(title, "epub");
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("EPUB downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export EPUB.");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleGenerateAlternateEndings = async () => {
    if (!selectedStory) return;

    setErrorMessage(null);
    setIsGeneratingEndings(true);
    const toastId = toast.loading("Generating alternate endings...");

    try {
      const payload = {
        title: selectedStory.title,
        content: originalStoryContent[selectedStory.uuid] || selectedStory.content,
        tag: selectedStory.tag,
        language: selectedStory.language || "English",
      };

      const generationRequest = isLogin
        ? generateAlternateEndings(payload)
        : generateFreeAlternateEndings(payload);

      const res = await generationRequest.unwrap();

      // Guard check validation
      if (!res || !Array.isArray(res.data)) {
        throw new Error("Invalid response from server");
      }

      setEndingsCache((prev) => ({ ...prev, [selectedStory.uuid]: res.data }));
      toast.success("Alternate endings generated successfully!");
    } catch (err: any) {
      console.error("[StoriesView Alternate Ending Flow Failure]:", err);
      const errorStatus = err?.status || err?.data?.status;
      const parsedMessage = errorStatus
        ? getErrorMessage(new ApiError(errorStatus, err?.data?.message || ""))
        : err?.message || "An unexpected failure occurred.";
      
      setErrorMessage(parsedMessage);
      toast.error("Failed to generate alternate endings.");
    } {
      toast.dismiss(toastId);
      setIsGeneratingEndings(false); // Fixes infinite spinner
    }
  };

  const handleApplyEnding = (endingData: { style: string; ending: string; fullStory: string }) => {
    if (!selectedStory) return;
    const updatedStory = { ...selectedStory, content: endingData.fullStory };
    setSelectedStory(updatedStory);
    setStories(stories.map((s) => (s.uuid === selectedStory.uuid ? updatedStory : s)));
    toast.success(`${endingData.style} applied to story!`);
  };

  const handleResetEnding = () => {
    if (!selectedStory) return;
    const originalContent = originalStoryContent[selectedStory.uuid];
    if (!originalContent) return;
    const updatedStory = { ...selectedStory, content: originalContent };
    setSelectedStory(updatedStory);
    setStories(stories.map((s) => (s.uuid === selectedStory.uuid ? updatedStory : s)));
    toast.success("Reverted to original story ending!");
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <Toaster />
      
      {/* Step 16: Error Banner Component UI Layout Rendering */}
      {errorMessage && (
        <div className="error-banner mb-6 p-4 bg-amber-500/20 border border-amber-500 rounded-xl text-amber-200 flex justify-between items-center animate-fadeIn">
          <div className="flex items-center gap-3">
            <span>⚠️</span>
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-xs uppercase font-bold tracking-wider hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {selectedStory ? (
          <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-black mb-2">{selectedStory.title}</h2>
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed mb-6">
              {selectedStory.content}
            </div>

            {/* Step 17: Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={handleGenerateAlternateEndings}
                disabled={isGeneratingEndings}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all text-white ${
                  isGeneratingEndings 
                    ? "bg-slate-700 cursor-not-allowed opacity-50" 
                    : "bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/20"
                }`}
              >
                {isGeneratingEndings ? "Generating Endings..." : "Generate Alternate Endings"}
              </button>
              
              <button
                onClick={handleExportPDF}
                className="px-5 py-2.5 rounded-xl font-bold transition-all text-slate-100 bg-slate-700 hover:bg-slate-600 active:scale-95 shadow-md"
              >
                📄 Export PDF
              </button>

              <button
                onClick={handleExportEPUB}
                className="px-5 py-2.5 rounded-xl font-bold transition-all text-slate-100 bg-slate-700 hover:bg-slate-600 active:scale-95 shadow-md"
              >
                📚 Export EPUB
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">No stories available.</div>
        )}
      </div>
    </div>
  );
};

export default StoriesViewComponent;