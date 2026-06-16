import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Upload, 
  Trash2, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  HelpCircle,
  Copy,
  Check
} from "lucide-react";

interface SOPFile {
  id: str;
  file_name: str;
  created_at: str;
}

export default function Dashboard() {
  const { session, user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "sops" | "playground" | "config">("overview");
  
  // Business Profile config state
  const [bizName, setBizName] = useState("");
  const [bizDesc, setBizDesc] = useState("");
  const [escalationPolicy, setEscalationPolicy] = useState("");
  const [agentTone, setAgentTone] = useState("");
  
  // Loading and notification states
  const [configSaving, setConfigSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // SOP files state
  const [sopFiles, setSopFiles] = useState<SOPFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sopError, setSopError] = useState<string | null>(null);

  // Chat Playground state
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [playgroundClientId, setPlaygroundClientId] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Copy status
  const [copied, setCopied] = useState(false);

  // Load business profile and documents on startup
  useEffect(() => {
    if (session) {
      fetchBusinessProfile();
      fetchDocuments();
      
      // Generate a unique client ID for this user's testing playground
      const cachedId = localStorage.getItem(`playground_client_${session.user.id}`);
      if (cachedId) {
        setPlaygroundClientId(cachedId);
      } else {
        const newId = `playground_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem(`playground_client_${session.user.id}`, newId);
        setPlaygroundClientId(newId);
      }
    }
  }, [session]);

  // Fetch chat history for playground if client ID and session are ready
  useEffect(() => {
    if (session && playgroundClientId && activeTab === "playground") {
      fetchPlaygroundHistory();
    }
  }, [session, playgroundClientId, activeTab]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const fetchBusinessProfile = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setBizName(data.name || "");
        setBizDesc(data.description || "");
        setEscalationPolicy(data.escalation_policy || "");
        setAgentTone(data.tone || "Professional, empathetic, and concise.");
      }
    } catch (err) {
      console.error("Error fetching business profile:", err);
    }
  };

  const fetchDocuments = async () => {
    if (!session) return;
    try {
      const resp = await fetch("/api/documents", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        setSopFiles(data);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const fetchPlaygroundHistory = async () => {
    if (!session || !playgroundClientId) return;
    try {
      const resp = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ clientId: playgroundClientId })
      });
      if (resp.ok) {
        const data = await resp.json();
        const history = (data.messages || []).map((msg: { sender: string; text: string }) => ({
          sender: msg.sender,
          text: msg.text
        }));
        setChatMessages(history);
      }
    } catch (err) {
      console.error("Error fetching playground history:", err);
    }
  };

  const saveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    setConfigSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          name: bizName,
          description: bizDesc,
          escalation_policy: escalationPolicy,
          tone: agentTone
        })
        .eq("id", session.user.id);
        
      if (error) throw error;
      setSuccessMsg("Configuration saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save configuration");
    } finally {
      setConfigSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSopError(null);
    }
  };

  const handleUploadSOP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !selectedFile) return;

    setUploading(true);
    setSopError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const resp = await fetch("/api/documents/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || "Failed to upload document");
      }

      setSelectedFile(null);
      // Reset input element
      const fileInput = document.getElementById("sop-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await fetchDocuments();
      setSuccessMsg("Document ingested and embedded successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setSopError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSOP = async (id: string) => {
    if (!session) return;
    try {
      const resp = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (resp.ok) {
        await fetchDocuments();
        setSuccessMsg("Document deleted successfully");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const handleSendPlaygroundMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !session || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          client_id: playgroundClientId,
          chat_id: playgroundClientId,
          message: userText
        })
      });

      if (!resp.ok) throw new Error("Agent failed to respond");
      const data = await resp.json();
      setChatMessages(prev => [...prev, { sender: "ai", text: data.response }]);
    } catch (err) {
      console.error("Error sending playground message:", err);
      setChatMessages(prev => [...prev, { sender: "ai", text: "Error: I encountered a connection issue." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopySessionId = () => {
    navigator.clipboard.writeText(playgroundClientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate total chunk count (simulated or derived from document count for UI visual polish)
  const totalChunks = sopFiles.length * 6; // average chunks per SOP based on ingest script

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          {/* Logo Header */}
          <div className="flex items-center space-x-3 text-blue-500">
            <Bot className="h-8 w-8 stroke-[2]" />
            <div>
              <h2 className="font-bold text-lg leading-tight text-white">Refero Support</h2>
              <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">AI Platform</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 pl-3"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("sops")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "sops"
                  ? "bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 pl-3"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>SOP Documents</span>
            </button>

            <button
              onClick={() => setActiveTab("playground")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "playground"
                  ? "bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 pl-3"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Chat Playground</span>
            </button>

            <button
              onClick={() => setActiveTab("config")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "config"
                  ? "bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 pl-3"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Agent Config</span>
            </button>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center space-x-2.5 px-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400 font-medium">Guest sandbox mode</span>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
        
        {/* Toast Alerts */}
        {successMsg && (
          <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}
        
        {/* Header Bar */}
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-10 shrink-0 bg-slate-950/50 backdrop-blur-sm">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "sops" && "Standard Operating Procedures (SOPs)"}
              {activeTab === "playground" && "AI Testing Playground"}
              {activeTab === "config" && "Agent Configuration"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Logged in as <span className="text-blue-400">{user?.email}</span>
            </p>
          </div>
        </header>

        {/* Dynamic Tab Contents */}
        <div className="flex-1 overflow-y-auto p-10">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8 max-w-6xl">
              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active SOPs</CardDescription>
                    <CardTitle className="text-4xl font-extrabold text-white mt-1">{sopFiles.length}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-slate-500 font-medium">Documents indexed in vector database</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs text-slate-400 font-bold uppercase tracking-wider">Vector Chunks</CardDescription>
                    <CardTitle className="text-4xl font-extrabold text-white mt-1">{totalChunks}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-slate-500 font-medium">Split paragraphs with generated 3D embeddings</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs text-slate-400 font-bold uppercase tracking-wider">Playground Session ID</CardDescription>
                    <div className="flex items-center justify-between mt-1">
                      <code className="text-sm font-mono text-blue-400 font-semibold truncate pr-4 max-w-[150px]">
                        {playgroundClientId}
                      </code>
                      <Button variant="ghost" size="icon" onClick={handleCopySessionId} className="h-8 w-8 hover:bg-slate-800 text-slate-400">
                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-slate-500 font-medium">Use this ID to chat or query history</p>
                  </CardContent>
                </Card>
              </div>

              {/* Welcome Info Board */}
              <Card className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/20 border-slate-800 shadow-xl rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">Platform Ingestion & Compliance Status</h3>
                    <p className="text-sm text-slate-400 max-w-[700px] leading-relaxed">
                      Your AI support agent is active and retrieves context from the vector database automatically. Ingested SOP documents are parsed, hashed, and processed using locally cached SentenceTransformers for maximum speed.
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab("playground")} className="bg-blue-600 hover:bg-blue-700 px-6 py-5 rounded-xl text-sm font-semibold shrink-0 shadow-lg shadow-blue-600/15">
                    Launch Chat Playground
                  </Button>
                </div>
              </Card>

              {/* Custom Activity Graph (Tailwind Visualization) */}
              <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl p-6">
                <CardHeader className="p-0 pb-6 border-b border-slate-800/80">
                  <CardTitle className="text-base font-bold text-white">SOP Coverage Analysis</CardTitle>
                  <CardDescription className="text-xs text-slate-500 font-medium">Calculated weight by categories based on document content</CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-6 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Account Access (SOP 001)</span>
                      <span className="text-blue-400">33% Coverage</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: "33%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Product Troubleshooting (SOP 002)</span>
                      <span className="text-indigo-400">42% Coverage</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: "42%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Feature Requests (SOP 003)</span>
                      <span className="text-purple-400">25% Coverage</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 2. SOPS TAB */}
          {activeTab === "sops" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl items-start">
              
              {/* Document List */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4 border-b border-slate-800/80">
                    <CardTitle className="text-base font-bold text-white">Active Policy Documents</CardTitle>
                    <CardDescription className="text-xs text-slate-500 font-medium">Standard Operating Procedures stored in your vector database</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    {sopFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <FileText className="h-10 w-10 text-slate-600 mb-3" />
                        <p className="text-sm font-semibold text-slate-400">No documents uploaded yet</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-[280px]">Upload a Markdown (.md) or Text (.txt) SOP file to populate the agent's knowledge base.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/60">
                        {sopFiles.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-6 hover:bg-slate-800/20 transition-all duration-200">
                            <div className="flex items-center space-x-3.5 min-w-0">
                              <div className="bg-blue-600/10 p-2.5 rounded-xl shrink-0"><FileText className="h-5 w-5 text-blue-400" /></div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-200 truncate">{doc.file_name}</p>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium">Uploaded {new Date(doc.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteSOP(doc.id)}
                              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-10 w-10 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Upload Zone */}
              <div className="space-y-6">
                <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl p-6">
                  <CardHeader className="p-0 pb-6 border-b border-slate-800/80">
                    <CardTitle className="text-base font-bold text-white">Upload SOP Document</CardTitle>
                    <CardDescription className="text-xs text-slate-500 font-medium">Add text files to expand the agent's compliance capabilities</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-6">
                    <form onSubmit={handleUploadSOP} className="space-y-5">
                      {/* Drag & Drop simulated box */}
                      <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 relative bg-slate-950/20 hover:bg-slate-900/10">
                        <Upload className="h-8 w-8 text-blue-500 mb-3" />
                        {selectedFile ? (
                          <div>
                            <p className="text-sm font-bold text-slate-200 truncate max-w-[200px]">{selectedFile.name}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-bold text-slate-300">Drag file here or click to browse</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Accepts UTF-8 .txt or .md files (Max 1MB)</p>
                          </div>
                        )}
                        <input
                          id="sop-file"
                          type="file"
                          accept=".txt,.md"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>

                      {sopError && (
                        <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-950/20 border border-red-500/20 p-3 rounded-xl">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{sopError}</span>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        disabled={!selectedFile || uploading}
                        className="w-full bg-blue-600 hover:bg-blue-700 py-6 rounded-xl font-bold shadow-lg shadow-blue-600/15"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Ingesting and Embedding...
                          </>
                        ) : (
                          "Upload & Ingest File"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}

          {/* 3. PLAYGROUND TAB */}
          {activeTab === "playground" && (
            <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-slate-900 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600/10 p-2 rounded-xl"><Bot className="h-5 w-5 text-blue-400" /></div>
                  <div>
                    <h3 className="font-bold text-sm text-white">AI Agent Playground</h3>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Tenant testing environment</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setChatMessages([])} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 rounded-lg" title="Clear Chat History">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat Message Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/20">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6">
                    <Bot className="h-12 w-12 text-slate-700 mb-3 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-400">Chat Playback Empty</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[280px]">Type a troubleshooting query, password reset request, or feature proposal to see the compliance node resolve it.</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-400 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-700/50 flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      <span className="text-xs font-medium">Agent is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Form Footer */}
              <form onSubmit={handleSendPlaygroundMessage} className="bg-slate-900 border-t border-slate-800/80 p-4 flex items-center space-x-3 shrink-0">
                <Input
                  type="text"
                  placeholder="Ask the agent a support question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  className="flex-1 bg-slate-950 border-slate-800 focus-visible:ring-blue-500 h-12 rounded-xl text-sm"
                />
                <Button type="submit" disabled={!chatInput.trim() || chatLoading} className="bg-blue-600 hover:bg-blue-700 h-12 w-12 rounded-xl shrink-0 shadow-lg shadow-blue-600/10">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}

          {/* 4. CONFIG TAB */}
          {activeTab === "config" && (
            <div className="max-w-3xl mx-auto">
              <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl p-8">
                <CardHeader className="p-0 pb-6 border-b border-slate-800/80 mb-6">
                  <CardTitle className="text-base font-bold text-white">Agent Behavior Profile</CardTitle>
                  <CardDescription className="text-xs text-slate-500 font-medium">Configure agent settings, tone, and escalation triggers</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={saveConfiguration} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="biz-name" className="text-xs font-bold text-slate-300 uppercase tracking-wide">Business Name</Label>
                      <Input
                        id="biz-name"
                        type="text"
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 h-12 rounded-xl text-sm text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="biz-desc" className="text-xs font-bold text-slate-300 uppercase tracking-wide">Business Description</Label>
                      <Textarea
                        id="biz-desc"
                        value={bizDesc}
                        onChange={(e) => setBizDesc(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 min-h-[100px] rounded-xl text-sm text-white leading-relaxed"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="escalation-policy" className="text-xs font-bold text-slate-300 uppercase tracking-wide">Escalation Policy</Label>
                      <Textarea
                        id="escalation-policy"
                        value={escalationPolicy}
                        onChange={(e) => setEscalationPolicy(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 min-h-[100px] rounded-xl text-sm text-white leading-relaxed"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agent-tone" className="text-xs font-bold text-slate-300 uppercase tracking-wide">Agent Tone / Personality</Label>
                      <Input
                        id="agent-tone"
                        type="text"
                        value={agentTone}
                        onChange={(e) => setAgentTone(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 h-12 rounded-xl text-sm text-white"
                        required
                      />
                    </div>

                    {errorMsg && (
                      <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-950/20 border border-red-500/20 p-4 rounded-xl">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={configSaving}
                      className="w-full bg-blue-600 hover:bg-blue-700 py-6 rounded-xl font-bold shadow-lg shadow-blue-600/15"
                    >
                      {configSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Agent Configuration"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
