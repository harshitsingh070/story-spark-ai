import React, { useEffect, useState, useRef } from "react";
import { getShortenedText, ITopicData, topicsData,  } from "./stories.utils";
import toast, { Toaster } from "react-hot-toast";
import { useCreatePostMutation, useDeletePostMutation } from "../../redux/apis/post.api";
import StoryGeneratingAnimation from "../loading/story-generating-animation.component";
import {
  useGenerateAlternateEndingsMutation,
  useGenerateFreeAlternateEndingsMutation,
} from "../../redux/apis/ai.model.api";
export interface IStories {
  uuid: string;
  title: string;
  content: string;
  tag: string;
  emotions?: string[];
  enhancedPrompt?: string;
  imageURL: string;
  language?: string;
  genre?: string;
}

interface IPost extends IStories {
  topic: ITopicData[];
}

interface StoriesComponentProps {
  stories: IStories[];
  isLogin: boolean;
  setStories: (stories: IStories[]) => void;
  onPublishSuccess?: () => void;
  isLoading?: boolean;
}

/* ─── Inline styles (no extra CSS file needed) ─── */
const styles: Record<string, React.CSSProperties> = {
  /* action bar */
  actionBar: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    marginBottom: "16px",
    alignItems: "center",
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
    transition: "all 0.18s ease",
    background: "rgba(255,255,255,0.06)",
    color: "#d1d5db",
    backdropFilter: "blur(6px)",
  },
  publishBtn: {
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    border: "none",
    color: "#fff",
    padding: "8px 22px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.2s",
    boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
  },

  /* narration card */
  narrationCard: {
    background: "rgba(15, 23, 42, 0.7)",
    border: "1px solid rgba(99, 102, 241, 0.25)",
    borderRadius: "16px",
    padding: "20px 24px",
    marginTop: "20px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  },
  narrationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  narrationTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#e2e8f0",
    fontWeight: 700,
    fontSize: "15px",
  },
  readyBadge: {
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16,185,129,0.4)",
    color: "#34d399",
    fontSize: "11px",
    fontWeight: 600,
    borderRadius: "20px",
    padding: "3px 10px",
    letterSpacing: "0.04em",
  },
  storySubtitle: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "2px",
  },

  /* playback controls */
  controls: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "20px",
  },
  playBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "10px 0",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "all 0.18s ease",
    background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
    color: "#93c5fd",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  pauseBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "10px 0",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(30,41,59,0.8)",
    color: "#94a3b8",
    transition: "all 0.18s ease",
  },
  resumeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "10px 0",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid rgba(16,185,129,0.3)",
    background: "rgba(6,78,59,0.45)",
    color: "#34d399",
    transition: "all 0.18s ease",
  },
  stopBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "10px 0",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid rgba(239,68,68,0.3)",
    background: "rgba(127,29,29,0.4)",
    color: "#f87171",
    transition: "all 0.18s ease",
  },

  /* progress section */
  progressRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  progressLabel: { color: "#64748b", fontSize: "12px", fontWeight: 500 },
  progressWords: { color: "#94a3b8", fontSize: "12px" },
  progressTrack: {
    width: "100%",
    height: "5px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "99px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
    borderRadius: "99px",
    transition: "width 0.4s ease",
  },
  progressFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: { color: "#64748b", fontSize: "11px", fontStyle: "italic" },

  /* speed select */
  speedWrap: { display: "flex", alignItems: "center", gap: "8px" },
  speedLabel: { color: "#64748b", fontSize: "11px", fontWeight: 500 },
  speedSelect: {
    background: "rgba(30,41,59,0.9)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "7px",
    color: "#cbd5e1",
    fontSize: "12px",
    padding: "4px 8px",
    cursor: "pointer",
    outline: "none",
  },
};

/* ─── Playback sub-component ─── */
const NarrationPlayer: React.FC<{ title: string }> = ({ title }) => {
  const [progress] = useState(24);
  const [wordCount] = useState({ current: 12, total: 50 });

  return (
    <div style={styles.narrationCard}>
      {/* Header */}
      <div style={styles.narrationHeader}>
        <div>
          <div style={styles.narrationTitle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            Listen to this story
          </div>
          <div style={styles.storySubtitle}>{title}</div>
        </div>
        <span style={styles.readyBadge}>● Ready to narrate</span>
      </div>

      {/* Controls — contained grid, no overflow */}
      <div style={styles.controls}>
        <button style={styles.playBtn}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          Play
        </button>
        <button style={styles.pauseBtn}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          Pause
        </button>
        <button style={styles.resumeBtn}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.51"/></svg>
          Resume
        </button>
        <button style={styles.stopBtn}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          Stop
        </button>
      </div>

      {/* Progress */}
      <div style={styles.progressRow}>
        <span style={styles.progressLabel}>Progress</span>
        <span style={styles.progressWords}>{wordCount.current} / {wordCount.total} words</span>
      </div>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>
      <div style={styles.progressFooter}>
        <span style={styles.statusText}>Narration paused</span>
        <div style={styles.speedWrap}>
          <span style={styles.speedLabel}>Playback speed</span>
          <select style={styles.speedSelect} defaultValue="1">
            <option value="0.5">0.5×</option>
            <option value="0.75">0.75×</option>
            <option value="1">1×</option>
            <option value="1.25">1.25×</option>
            <option value="1.5">1.5×</option>
            <option value="2">2×</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/* ─── Main component ─── */
const StoriesViewComponent: React.FC<StoriesComponentProps> = ({
  stories,
  isLogin,
  setStories,
  isLoading,
  onPublishSuccess,
}) => {
  

  // Start with a clean state that adapts dynamically
  const [selectedStory, setSelectedStory] = useState<IStories | null>(null);
  const [topics, setTopics] = useState<ITopicData[]>(topicsData);
  const [selectTopics, setSelectTopics] = useState<ITopicData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [createPost] = useCreatePostMutation();
  const [deletePost] = useDeletePostMutation();
  const savedPostIdRef = useRef<string | null>(null);
  // Alternate ending state & hooks
  const [endingsCache, setEndingsCache] = useState<{
    [uuid: string]: { style: string; ending: string; fullStory: string }[];
  }>({});
  const [originalStoryContent, setOriginalStoryContent] = useState<{
    [uuid: string]: string;
  }>({});
  const [isGeneratingEndings, setIsGeneratingEndings] = useState<boolean>(false);
  const [activeEndingTab, setActiveEndingTab] = useState<string>("Happy Ending");

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

  const handleGenerateAlternateEndings = async () => {
    if (!selectedStory) return;
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
      if (res && res.data) {
        setEndingsCache((prev) => ({
          ...prev,
          [selectedStory.uuid]: res.data,
        }));
        toast.success("Alternate endings generated successfully!");
      } else {
        toast.error("Failed to generate alternate endings.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate alternate endings. Please try again.");
    } finally {
      toast.dismiss(toastId);
      setIsGeneratingEndings(false);
    }
  };

  const handleApplyEnding = (endingData: { style: string; ending: string; fullStory: string }) => {
    if (!selectedStory) return;
    const updatedStory = {
      ...selectedStory,
      content: endingData.fullStory,
    };
    setSelectedStory(updatedStory);
    setStories(
      stories.map((s) => (s.uuid === selectedStory.uuid ? updatedStory : s))
    );
    toast.success(`${endingData.style} applied to story!`);
  };

  const handleResetEnding = () => {
    if (!selectedStory) return;
    const originalContent = originalStoryContent[selectedStory.uuid];
    if (!originalContent) return;
    const updatedStory = {
      ...selectedStory,
      content: originalContent,
    };
    setSelectedStory(updatedStory);
    setStories(
      stories.map((s) => (s.uuid === selectedStory.uuid ? updatedStory : s))
    );
    toast.success("Reverted to original story ending!");
  };

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPausedAudio, setIsPausedAudio] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTextToSpeech = () => {
    if (!selectedStory?.content) return;

    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      if (isPausedAudio) {
        window.speechSynthesis.resume();
        setIsPausedAudio(false);
        toast.success("Resumed reading story");
      } else {
        window.speechSynthesis.pause();
        setIsPausedAudio(true);
        toast.success("Paused reading story");
      }
    } else {
      window.speechSynthesis.cancel();
      const cleanContent = selectedStory.content.replace(/<[^>]*>/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanContent);
      
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
      };

      utterance.onerror = (e) => {
        console.error("SpeechSynthesis error:", e);
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
      };

      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (v) => v.lang.startsWith("en-") && v.name.includes("Google")
      ) || voices.find((v) => v.lang.startsWith("en-"));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
      toast.success("Playing story audio");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStopAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    toast.success("Stopped audio playback");
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setSelectTopics(topics.filter((topic) => topic.selected));
  }, [topics]);

  useEffect(() => {
    if (stories && stories.length > 0) setSelectedStory(stories[0]);
  }, [stories]);

  const handelStorySelection = (story: IStories) => setSelectedStory(story);

  const handleTopicClick = (index: number) => {
    const updated = [...topics];
    updated[index].selected = !updated[index].selected;
    setTopics(updated);
  };


  async function handleCopyStory() {
    if (selectedStory?.content) {
      await navigator.clipboard.writeText(selectedStory.content);
      setIsCopied(true);
      toast.success("Story copied!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  }

  const handelPublishStory = async () => {
    if (!isLogin) { toast.error("Please login to publish the story."); return; }
    if (!selectedStory) { toast.error("No story available. Please generate a story first."); return; }
    const post: IPost = { ...selectedStory, topic: selectTopics };
    setLoading(true);
    try {
      if (savedPostIdRef.current) {
        try {
          await deletePost(savedPostIdRef.current).unwrap();
        } catch (deleteError) {
          console.warn("Failed to delete auto-saved draft before publishing:", deleteError);
        }
      }
      const result = await createPost(post).unwrap();
      if (result) {
        toast.success("Story published successfully!");
        setStories([]);
        setSelectedStory(null);
        onPublishSuccess?.();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

 


if (isLoading) {
  return (
    <div className="flex items-center justify-center py-20">
      <StoryGeneratingAnimation />
    </div>
  );
}
  if (!selectedStory) {
    return null;
  }

  return (
    <div className="mt-16 px-4 sm:px-6 md:px-10 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="col-span-1 lg:col-span-8">

          {/* Title + story bubbles */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-5">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-400">
              {selectedStory?.title}
            </h1>
            <div className="flex justify-end">
              <div className="flex -space-x-4">
                {stories && stories.length > 0 ? (
                  stories.map((story) => (
                    <button
                      key={story.uuid}
                      className={`relative w-14 h-14 rounded-full border-2 ${
                        selectedStory?.uuid === story.uuid
                          ? "border-blue-500 scale-110"
                          : "border-white/20"
                      } hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-600`}
                      onClick={() => handelStorySelection(story)}
                    >
                      <img src={story.imageURL} alt={story.title} className="w-full h-full object-cover rounded-full" />
                    </button>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No stories available.</span>
                )}
              </div>
            </div>
          </div>

          {/* Story card */}
          <div className="bg-blue-500/10 border border-gray-600 p-6 rounded-2xl shadow-lg">
            {/* Action toolbar */}
            <div style={styles.actionBar}>
              {selectedStory && (
                <button style={styles.actionBtn} onClick={handleCopyStory}>
                  {isCopied ? "✓" : "📋"} {isCopied ? "Copied" : "Copy"}
                </button>
              )}
              <button style={styles.actionBtn}>📄 Export PDF</button>
              <button style={styles.actionBtn}>⬇ Export Markdown</button>
              <button style={styles.actionBtn}>🗺 World Map</button>
              <button style={styles.actionBtn}>✨ Remix</button>
              <button style={styles.actionBtn}>🌐 Translate</button>
              <button
                style={{
                  ...styles.publishBtn,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onClick={handelPublishStory}
                disabled={loading}
              >
                {loading ? "Publishing…" : "Publish"}
              </button>
            </div>

            {/* Story text */}
            <div className="prose max-w-none text-gray-300 text-sm sm:text-base leading-relaxed">
              {selectedStory ? (
                <p className="break-words">{selectedStory.content}</p>
              ) : (
                <p className="text-gray-500">No story available. Please generate a story first.</p>
              )}
            </div>

            {/* Narration player — fully inside the card */}
            {selectedStory && <NarrationPlayer title={selectedStory.title} />}
          </div>

          {/* Continue story button */}
          {selectedStory && (
            <div className="mt-5">
              <button className="px-6 py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all duration-200">
                Continue Story
              </button>
            </div>
          )}

          {/* Topics */}
          <div className="mt-6">
            <div className="bg-blue-500/10 border border-gray-600 rounded-2xl shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-300 mb-4">Select Topics</h3>
              <div className="flex flex-wrap gap-2">
                {selectedStory ? (
                  topics.map((topic, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 ${topic.color} rounded-full text-sm hover:brightness-110 cursor-pointer transition-all`}
                      onClick={() => handleTopicClick(index)}
                    >
                      {topic.selected ? (
                        <i className="fa-solid fa-check mr-1" />
                      ) : (
                        <i className="fa-solid fa-plus mr-1" />
                      )}
                      {topic.title}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No topics available. Please generate a story first.</p>
                )}
              </div>
            </div>

            {/* Alternate Endings Section */}
            {selectedStory && (
              <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl p-6 mt-8 relative overflow-hidden">
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                      Alternate Endings
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Explore alternate narrative styles for your story context.
                    </p>
                  </div>
                  {selectedStory.content !== originalStoryContent[selectedStory.uuid] && (
                    <button
                      type="button"
                      onClick={handleResetEnding}
                      className="rounded-lg px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-700/50 font-semibold text-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-rotate-left"></i> Reset to Original
                    </button>
                  )}
                </div>

                {isGeneratingEndings ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-slate-300 text-sm font-medium animate-pulse">
                      Generating alternate endings...
                    </p>
                  </div>
                ) : endingsCache[selectedStory.uuid]?.length > 0 ? (
                  <div>
                    {/* Tabs */}
                    <div className="flex border-b border-slate-700/50 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none">
                      {[
                        { name: "Happy Ending" },
                        { name: "Dark Ending" },
                        { name: "Plot Twist Ending" },
                        { name: "Open Ending" },
                        { name: "Cliffhanger Ending" }
                      ].map((s) => {
                        const hasEndings = endingsCache[selectedStory.uuid] || [];
                        const endingData = hasEndings.find((e) => e.style === s.name);
                        const isApplied = endingData && selectedStory.content === endingData.fullStory;
                        
                        return (
                          <button
                            key={s.name}
                            type="button"
                            onClick={() => setActiveEndingTab(s.name)}
                            className={`px-5 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                              activeEndingTab === s.name
                                ? "border-purple-500 text-purple-400 bg-purple-500/5"
                                : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <span>{s.name}</span>
                            {isApplied && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab content */}
                    {(() => {
                      const currentEndings = endingsCache[selectedStory.uuid] || [];
                      const currentEndingData = currentEndings.find((e) => e.style === activeEndingTab);
                      if (!currentEndingData) return null;
                      
                      const isCurrentlyApplied = selectedStory.content === currentEndingData.fullStory;
                      
                      return (
                        <div className="bg-slate-900/40 rounded-xl p-6 border border-slate-700/30">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-slate-200">
                              {activeEndingTab} Suggestion
                            </h4>
                            <div>
                              {isCurrentlyApplied ? (
                                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                                  <i className="fa-solid fa-check"></i> Applied to Story
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleApplyEnding(currentEndingData)}
                                  className="rounded-lg px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md hover:shadow-purple-500/20"
                                >
                                  Apply to Story
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 leading-relaxed text-slate-300 text-sm md:text-base italic shadow-inner whitespace-pre-wrap">
                              <p>{currentEndingData.ending}</p>
                            </div>
                            
                            <div>
                              <details className="group border border-slate-800 rounded-lg overflow-hidden bg-slate-950/20">
                                <summary className="list-none flex items-center justify-between p-3 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                                  <span>PREVIEW FULL STORY WITH THIS ENDING</span>
                                  <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
                                </summary>
                                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                                  {currentEndingData.fullStory}
                                </div>
                              </details>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 bg-slate-900/20 border border-dashed border-slate-700/40 rounded-xl">
                    <button
                      type="button"
                      onClick={handleGenerateAlternateEndings}
                      className="rounded-xl px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 flex items-center gap-2 cursor-pointer"
                    >
                      Generate Alternate Endings
                    </button>
                    <p className="text-xs text-slate-400 mt-3 text-center max-w-sm px-4 leading-relaxed">
                      Uses the story context to produce 5 unique ending variations (Happy, Dark, Plot Twist, Open, Cliffhanger) for comparison.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (preview) ── */}
        <div className="col-span-1 lg:col-span-4">
          <h1 className="text-2xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-400">
            Preview
          </h1>
          <div className="bg-blue-500/10 border border-gray-600 rounded-2xl shadow-lg overflow-hidden">
            {selectedStory ? (
              <div className="flex flex-col">
                <div className="m-2.5 overflow-hidden rounded-xl">
                  <img
                    src={selectedStory.imageURL}
                    alt="card-image"
                    className="w-full h-36 object-cover"
                  />
                </div>
                <div className="px-4 pb-4 pt-1">
                  <div className="mb-2 inline-flex items-center rounded-full bg-purple-600 py-1 px-3 text-xs font-semibold text-white shadow-sm">
                    {selectedStory.tag.toUpperCase()}
                  </div>
                  <h6 className="mb-1 text-gray-200 text-lg font-semibold">{selectedStory.title}</h6>
                  <p className="text-gray-400 text-sm leading-relaxed break-words">
                    {getShortenedText(selectedStory.content)}
                  </p>
                </div>
                <h6 className="mb-1 text-gray-300 text-xl font-semibold">
                  {selectedStory.title}
                </h6>
                <p className="text-gray-400 font-light breakwords text-sm sm:text-base">
                  {getShortenedText(selectedStory.content)}
                </p>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 text-sm">
                No story available. Please generate a story first.
              </div>
            )}
          </div>
        </div>
      </div>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default StoriesViewComponent;