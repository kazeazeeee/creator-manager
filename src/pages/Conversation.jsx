import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash, 
  Edit2, 
  Check, 
  Send, 
  MessageCircle, 
  RefreshCw, 
  AlertCircle,
  X,
  Paperclip,
  FileText,
  Copy
} from 'lucide-react';
import { apiChatWithManager, apiAnalyzeImage, apiParsePdf, apiParsePptx, apiExtractDraft } from '../utils/api';

const AGENT_MENTIONS_MAP = {
  '@team_kampanye': 'Team Kampanye',
  '@team_legal': 'Team Legal',
  '@team_negosiasi': 'Team Negosiasi',
  '@team_sponsor': 'Team Sponsor',
  '@team_creative': 'Team Creative',
  '@team_riset': 'Team Riset',
  '@team_pr': 'Team PR',
  '@team_komunitas': 'Team Komunitas',
  '@team_reporter': 'Team Reporter',
  '@team_kesehatan': 'Team Kesehatan',
  '@team_brief': 'Team Brief',
  '@team_finansial': 'Team Finansial'
};

const SUGGESTIONS = [
  "Bagaimana cara menaikkan rate card negosiasi?",
  "Tulis draf balasan formal untuk revisi berlebih",
  "Berikan ide konten estetis untuk hari ini",
  "Tulis skrip video Reels berdurasi 30 detik"
];

const Conversation = ({ apiKey, creatorProfile, addPipelineTask, refreshAllData }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitleText, setEditTitleText] = useState('');

  // Autocomplete Mentions states
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(0);
  const [activeMentionIdx, setActiveMentionIdx] = useState(0);
  const textareaRef = useRef(null);

  // Attachment states
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedFileContent, setAttachedFileContent] = useState('');
  const [attachedFileBase64, setAttachedFileBase64] = useState('');
  const [attachedFilePreview, setAttachedFilePreview] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);

  // Team Meeting states
  const [teamMeetingMode, setTeamMeetingMode] = useState(false);
  const [meetingAgent1, setMeetingAgent1] = useState('Team Brief');
  const [meetingAgent2, setMeetingAgent2] = useState('Team Finansial');
  const [meetingAgent3, setMeetingAgent3] = useState('None');



  // Dynamic thinking status helper
  const thinkingStepsRef = useRef([]);
  const thinkingTimerRef = useRef(null);

  const startThinkingAnimation = (steps) => {
    thinkingStepsRef.current = steps;
    let idx = 0;
    setThinkingStatus(steps[0]);
    if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
    thinkingTimerRef.current = setInterval(() => {
      idx++;
      if (idx < steps.length) {
        setThinkingStatus(steps[idx]);
      } else {
        // loop on last step
        setThinkingStatus(steps[steps.length - 1]);
      }
    }, 1800);
  };

  const stopThinkingAnimation = () => {
    if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
    thinkingTimerRef.current = null;
    setThinkingStatus('');
  };

  useEffect(() => {
    if (!loading) stopThinkingAnimation();
  }, [loading]);

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const handleSaveMessageToPipeline = async (text) => {
    if (!addPipelineTask) return;
    
    try {
      const proceed = window.confirm("Rapikan draf otomatis menggunakan AI dan simpan ke Alur Kerja Konten?");
      if (!proceed) return;

      setLoading(true);
      
      const structuredData = await apiExtractDraft(text);
      
      addPipelineTask({
        id: `task-${Date.now()}`,
        title: structuredData.title || "Draf Diskusi",
        brand: structuredData.brand || "Kemitraan",
        platform: structuredData.platform || "TikTok",
        status: "idea",
        dueDate: structuredData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        deliverables: structuredData.deliverables || "Draf Konten",
        notes: structuredData.notes || text
      });

      alert(`Draf berhasil dirapikan otomatis & disimpan ke Alur Kerja!\n\nProyek: ${structuredData.title}\nBrand: ${structuredData.brand}\nTenggat: ${structuredData.dueDate}\nPlatform: ${structuredData.platform}`);
    } catch (err) {
      console.error(err);
      alert(`Gagal mengekstrak draf: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 1. Load sessions on mount
  useEffect(() => {
    const saved = localStorage.getItem('creator-manager-chat-sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse chat sessions', e);
      }
    }
  }, []);

  // 2. Save sessions when they change
  const saveSessions = (updated) => {
    setSessions(updated);
    localStorage.setItem('creator-manager-chat-sessions', JSON.stringify(updated));
  };

  // 3. Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, loading]);

  const handleCreateSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession = {
      id: newId,
      title: `Diskusi Baru #${sessions.length + 1}`,
      messages: [
        {
          sender: 'assistant',
          text: `Halo ${creatorProfile?.name || 'Kreator'}! Saya adalah Manajer Digital Anda. Silakan sampaikan pertanyaan, draf email negosiasi, atau ide konten yang ingin Anda diskusikan. Saya di sini untuk membantu operasional kreatif Anda agar berjalan lebih profesional.`
        }
      ]
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Hapus sesi obrolan ini secara permanen?')) return;
    
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    
    if (activeSessionId === id) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleStartRename = (session, e) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleText(session.title);
  };

  const handleSaveRename = (id, e) => {
    e.stopPropagation();
    if (!editTitleText.trim()) return;
    
    const updated = sessions.map(s => {
      if (s.id === id) {
        return { ...s, title: editTitleText };
      }
      return s;
    });
    saveSessions(updated);
    setEditingSessionId(null);
  };

  // Shared file uploader/processor logic
  const processUploadedFile = async (file) => {
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert('Ukuran berkas melebihi batas maksimal 100MB.');
      return;
    }

    setUploadingFile(true);
    setAttachedFile(file);
    setAttachedFileContent('');
    setAttachedFileBase64('');
    setAttachedFilePreview('');

    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isPPTX = file.name.endsWith('.pptx') || file.name.endsWith('.ppt') || file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    const isText = file.type.startsWith('text/') || 
                   file.name.endsWith('.txt') || 
                   file.name.endsWith('.md') || 
                   file.name.endsWith('.json') || 
                   file.name.endsWith('.csv');

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result.split(',')[1];
        setAttachedFileBase64(base64);
        setAttachedFilePreview(event.target.result);
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } else if (isText) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFileContent(event.target.result);
        setUploadingFile(false);
      };
      reader.readAsText(file);
    } else if (isPDF) {
      try {
        const res = await apiParsePdf(file);
        setAttachedFileContent(res.text);
      } catch (err) {
        console.error(err);
        alert(`Gagal mengekstrak teks dari PDF: ${err.message}`);
        setAttachedFile(null);
      } finally {
        setUploadingFile(false);
      }
    } else if (isPPTX) {
      try {
        const res = await apiParsePptx(file);
        setAttachedFileContent(res.text);
      } catch (err) {
        console.error(err);
        alert(`Gagal mengekstrak teks dari PPTX: ${err.message}`);
        setAttachedFile(null);
      } finally {
        setUploadingFile(false);
      }
    } else {
      alert('Format berkas tidak didukung. Harap unggah gambar, berkas teks, dokumen PDF, atau slide PPTX.');
      setAttachedFile(null);
      setUploadingFile(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processUploadedFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeSession) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!activeSession) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file);
      e.dataTransfer.clearData();
    }
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    setAttachedFileContent('');
    setAttachedFileBase64('');
    setAttachedFilePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const filteredMentionAgents = Object.entries(AGENT_MENTIONS_MAP).filter(([key, role]) => {
    if (!mentionQuery) return true;
    return key.toLowerCase().includes(mentionQuery) || role.toLowerCase().includes(mentionQuery);
  });

  useEffect(() => {
    setActiveMentionIdx(0);
  }, [mentionQuery]);

  const checkMentionsAtCursor = (text, cursorIdx) => {
    const textBeforeCursor = text.substring(0, cursorIdx);
    const words = textBeforeCursor.split(/[\s\n]/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setShowMentionDropdown(true);
      setMentionQuery(lastWord.substring(1).toLowerCase());
      const lastWordStartIdx = textBeforeCursor.length - lastWord.length;
      setMentionStartIndex(lastWordStartIdx);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    checkMentionsAtCursor(val, e.target.selectionStart);
  };

  const handleTextareaSelect = (e) => {
    checkMentionsAtCursor(e.target.value, e.target.selectionStart);
  };

  const handleSelectAgentMention = (mentionKey) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorIdx = textarea.selectionStart;
    const textBeforeMention = inputText.substring(0, mentionStartIndex);
    const textAfterCursor = inputText.substring(cursorIdx);
    
    const newText = `${textBeforeMention}${mentionKey} ${textAfterCursor}`;
    setInputText(newText);
    setShowMentionDropdown(false);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = textBeforeMention.length + mentionKey.length + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleKeyDown = (e) => {
    if (showMentionDropdown && filteredMentionAgents.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveMentionIdx(prev => (prev + 1) % filteredMentionAgents.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveMentionIdx(prev => (prev - 1 + filteredMentionAgents.length) % filteredMentionAgents.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredMentionAgents[activeMentionIdx]) {
          handleSelectAgentMention(filteredMentionAgents[activeMentionIdx][0]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionDropdown(false);
      }
    } else {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if ((!text.trim() && !attachedFile) || loading || !activeSessionId) return;

    setShowMentionDropdown(false);

    const textLower = text.toLowerCase();
    let detectedAgentRole = null;
    let detectedAgentMention = null;
    
    for (const [key, role] of Object.entries(AGENT_MENTIONS_MAP)) {
      if (textLower.includes(key)) {
        detectedAgentRole = role;
        detectedAgentMention = key;
        break;
      }
    }

    let finalPrompt = text;
    let displayUserMessage = text;
    
    setLoading(true);

    // Build contextual thinking steps
    const thinkSteps = [];
    if (detectedAgentRole) {
      thinkSteps.push(`📡 Memanggil ${detectedAgentRole}...`);
    }
    if (attachedFile) {
      const isImg = attachedFile.type.startsWith('image/');
      thinkSteps.push(isImg ? '🖼️ Menganalisis gambar...' : '📄 Membaca berkas...');
    }
    thinkSteps.push('🧠 Berpikir...');
    thinkSteps.push('🔍 Mencari data relevan...');
    thinkSteps.push('✍️ Menyusun balasan...');
    startThinkingAnimation(thinkSteps);
    if (!textToSend) setInputText('');

    // Process attachment in chat
    if (attachedFile) {
      const isImage = attachedFile.type.startsWith('image/');
      
      if (isImage && attachedFileBase64) {
        try {
          if (!apiKey) {
            // Simulated local vision description if no key
            const simVision = `[Foto: ${attachedFile.name}] Objek visual terdeteksi. Silakan hubungkan API Key di Setelan untuk deskripsi visual AI secara penuh.`;
            finalPrompt = `[Foto: ${attachedFile.name}]\n----------\n${simVision}\n----------\nPertanyaan: ${text}`;
            displayUserMessage = `[Foto: ${attachedFile.name}]\n${text}`;
          } else {
            const visionRes = await apiAnalyzeImage(attachedFileBase64, attachedFile.type);
            finalPrompt = `[Isi Foto: ${attachedFile.name}]\n----------\n${visionRes.description}\n----------\nPertanyaan: ${text}`;
            displayUserMessage = `[Foto: ${attachedFile.name}]\n${text}`;
          }
        } catch (err) {
          console.error('Failed to describe image:', err);
          alert(`Gagal menganalisis gambar: ${err.message}. Mengirim pesan tanpa data gambar.`);
          finalPrompt = text;
        }
      } else if (attachedFileContent) {
        finalPrompt = `[Isi Berkas: ${attachedFile.name}]\n----------\n${attachedFileContent}\n----------\nPertanyaan: ${text}`;
        displayUserMessage = `[Berkas: ${attachedFile.name}]\n${text}`;
      }

      handleRemoveAttachment();
    }

    const userMessage = { sender: 'user', text: displayUserMessage };
    
    // Update local state with user message immediately
    const updatedMessagesForState = [...(activeSession?.messages || []), userMessage];
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: updatedMessagesForState };
      }
      return s;
    });
    
    saveSessions(updatedSessions);

    // Prompt for the API completion includes full file details in final message
    const historyForApi = [
      ...(activeSession?.messages || []),
      { sender: 'user', text: finalPrompt }
    ];

    try {
      if (teamMeetingMode) {
        // --- Team Meeting Mode: Single Collaborative Response ---
        const selectedAgents = [meetingAgent1, meetingAgent2, meetingAgent3].filter(a => a && a !== 'None');
        
        const cleanAgentName = (name) => `@${name.toLowerCase().replace(/\s+/g, '_')}`;
        const formattedAgentsNames = selectedAgents.map(cleanAgentName).join(', ');

        const thinkSteps = [
          `👥 Rapat Tim: Memulai diskusi dengan ${formattedAgentsNames}...`,
          `🧠 Mencocokkan perspektif ${selectedAgents.length} asisten...`,
          `✍️ Menggabungkan hasil keputusan rapat tim...`
        ];
        startThinkingAnimation(thinkSteps);

        const res = await apiChatWithManager(historyForApi, 'Team Meeting', selectedAgents);
        if (res.actionExecuted && refreshAllData) {
          refreshAllData();
        }

        const msgTeamResponse = { sender: 'assistant', senderName: '👥 Rapat Tim', text: res.reply };
        const finalMessages = [...updatedMessagesForState, msgTeamResponse];

        saveSessions(sessions.map(s => {
          if (s.id === activeSessionId) {
            return { ...s, messages: finalMessages };
          }
          return s;
        }));
      } else {
        // --- Normal Single Agent Flow ---
        const res = await apiChatWithManager(historyForApi, detectedAgentRole);
        if (res.actionExecuted && refreshAllData) {
          refreshAllData();
        }
        const finalMessages = [...updatedMessagesForState, { sender: 'assistant', text: res.reply }];
        saveSessions(sessions.map(s => {
          if (s.id === activeSessionId) {
            return { ...s, messages: finalMessages };
          }
          return s;
        }));
      }
    } catch (err) {
      console.error(err);
      const errorMsg = { 
        sender: 'assistant', 
        text: `Maaf, saya mengalami kendala koneksi saat menghubungi server: ${err.message}` 
      };
      saveSessions(sessions.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...updatedMessagesForState, errorMsg] };
        }
        return s;
      }));
    } finally {
      setLoading(false);
    }
  };

  // handleKeyDown is used instead of handleKeyPress to support Arrow keys and dropdown selection

  // Inline markdown formatter helpers
  const highlightKeywords = (text, keyPrefix = 'hl') => {
    if (typeof text !== 'string') return text;
    
    const keywordRegex = /\b(brief|kampanye|campaign|sponsor|rate[ -]?card|rates|tarif|budget|anggaran|invoice|deadline|tenggat|revisi|kontrak|eksklusivitas|exclusivity|denda|pembayaran|negosiasi|nego|draf|draft|jadwal|agenda|kolaborasi|collaboration|agreement|brand)(nya|an|kan|i|mu|ku)?\b/gi;
    
    if (!keywordRegex.test(text)) {
      return [text];
    }
    
    keywordRegex.lastIndex = 0;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = keywordRegex.exec(text)) !== null) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) parts.push(textBefore);
      
      const matchedText = match[0];
      parts.push(
        <span key={`${keyPrefix}-${match.index}`} className="highlight-keyword">
          {matchedText}
        </span>
      );
      lastIndex = keywordRegex.lastIndex;
    }
    
    const remaining = text.substring(lastIndex);
    if (remaining) parts.push(remaining);
    
    return parts;
  };

  const highlightText = (text, keyPrefix = 'hl') => {
    if (typeof text !== 'string') return text;

    const keys = Object.keys(AGENT_MENTIONS_MAP);
    if (keys.length === 0) {
      return highlightKeywords(text, keyPrefix);
    }
    
    const mentionPattern = new RegExp(keys.join('|'), 'gi');
    if (!mentionPattern.test(text)) {
      return highlightKeywords(text, keyPrefix);
    }
    
    mentionPattern.lastIndex = 0;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = mentionPattern.exec(text)) !== null) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push(...highlightKeywords(textBefore, `${keyPrefix}-pre-${match.index}`));
      }
      
      const matchedMention = match[0];
      const normalizedMention = matchedMention.toLowerCase();
      const agentRoleName = AGENT_MENTIONS_MAP[normalizedMention] || 'Agen';
      
      parts.push(
        <span 
          key={`${keyPrefix}-mention-${match.index}`} 
          className="highlight-mention-badge"
          style={{
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--accent-color)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '2px 6px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            margin: '0 2px',
            fontFamily: 'var(--font-sans)',
            cursor: 'help'
          }}
          title={`Agen Spesialis: ${agentRoleName}`}
        >
          {matchedMention}
        </span>
      );
      
      lastIndex = mentionPattern.lastIndex;
    }
    
    const remaining = text.substring(lastIndex);
    if (remaining) {
      parts.push(...highlightKeywords(remaining, `${keyPrefix}-post`));
    }
    
    return parts;
  };

  const parseInlineMarkdown = (text) => {
    const boldRegex = /\*\*([\s\S]*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) parts.push(textBefore);
      parts.push(<strong key={match.index}>{highlightText(match[1], `str-${match.index}`)}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    
    const remaining = text.substring(lastIndex);
    if (remaining) parts.push(remaining);
    
    return parts.map((part, idx) => {
      if (typeof part === 'string') {
        const codeRegex = /`([^`]+)`/g;
        const subParts = [];
        let lastSubIdx = 0;
        let subMatch;
        
        while ((subMatch = codeRegex.exec(part)) !== null) {
          const textBefore = part.substring(lastSubIdx, subMatch.index);
          if (textBefore) {
            subParts.push(...highlightText(textBefore, `cb-${idx}-${subMatch.index}`));
          }
          subParts.push(<code key={subMatch.index}>{subMatch[1]}</code>);
          lastSubIdx = codeRegex.lastIndex;
        }
        
        const subRemaining = part.substring(lastSubIdx);
        if (subRemaining) {
          subParts.push(...highlightText(subRemaining, `cr-${idx}`));
        }
        return subParts;
      }
      return part;
    });
  };

  const formatMessageText = (text) => {
    if (!text) return '';
    
    const parts = [];
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }
      parts.push({ type: 'code', content: match[1] });
      lastIndex = codeBlockRegex.lastIndex;
    }
    
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      parts.push({ type: 'text', content: remainingText });
    }
    
    return parts.map((part, idx) => {
      if (part.type === 'code') {
        const lines = part.content.split('\n');
        let firstLine = lines[0].trim();
        let codeContent = part.content;
        const knownLanguages = ['javascript', 'js', 'html', 'css', 'json', 'python', 'bash'];
        if (knownLanguages.includes(firstLine)) {
          codeContent = lines.slice(1).join('\n');
        }
        return (
          <pre key={idx}>
            <code>{codeContent.trim()}</code>
          </pre>
        );
      } else {
        const lines = part.content.split('\n');
        return lines.map((line, lIdx) => {
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return <li key={lIdx} style={{ marginLeft: '12px' }}>{parseInlineMarkdown(line.trim().substring(2))}</li>;
          }
          if (/^\d+\.\s/.test(line.trim())) {
            const content = line.trim().replace(/^\d+\.\s/, '');
            return <li key={lIdx} style={{ listStyleType: 'decimal', marginLeft: '12px' }}>{parseInlineMarkdown(content)}</li>;
          }
          if (line.trim() === '') return <div key={lIdx} style={{ height: '6px' }} />;
          return <p key={lIdx} style={{ margin: '2px 0 6px 0' }}>{parseInlineMarkdown(line)}</p>;
        });
      }
    });
  };

  return (
    <div>
      <div className="content-header">
        <div className="content-title">
          <h1>Diskusi Manajer</h1>
          <p>Diskusikan operasional bisnis kustom, penawaran harga sponsor, revisi klien, atau kelola ide harian Anda.</p>
        </div>
      </div>

      {!apiKey && (
        <div className="card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderColor: 'var(--danger-color)', padding: '12px 18px', backgroundColor: 'rgba(255, 68, 68, 0.02)' }}>
          <AlertCircle size={16} className="text-danger" style={{ color: 'var(--danger-color)', flexShrink: 0 }} />
          <div style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>
            <strong>Perhatian:</strong> API Key belum diatur di menu <strong>Setelan</strong>. Chat akan berjalan dalam mode simulasi.
          </div>
        </div>
      )}

      <div className="conversation-container">
        {/* Sidebar */}
        <div className="conversation-sidebar">
          <div className="conversation-sidebar-header">
            <span className="conversation-sidebar-title">Riwayat Diskusi</span>
            <button 
              className="btn btn-primary" 
              style={{ padding: '6px 8px', fontSize: '11px', gap: '4px' }}
              onClick={handleCreateSession}
            >
              <Plus size={12} /> Baru
            </button>
          </div>

          <div className="session-list">
            {sessions.map(s => {
              const isEditing = editingSessionId === s.id;
              const isActive = activeSessionId === s.id;
              
              return (
                <div 
                  key={s.id} 
                  className={`session-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveSessionId(s.id)}
                >
                  <div className="session-title-wrapper">
                    <MessageCircle size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editTitleText}
                        onChange={(e) => setEditTitleText(e.target.value)}
                        onBlur={() => handleSaveRename(s.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveRename(s.id)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          width: '100%',
                          fontSize: '11px',
                          outline: 'none'
                        }}
                      />
                    ) : (
                      <span className="session-title">{s.title}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="session-actions">
                      <button 
                        className="session-action-btn"
                        onClick={(e) => handleStartRename(s, e)}
                        title="Rename"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        className="session-action-btn delete"
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        title="Delete"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <button 
                      className="session-action-btn"
                      onClick={(e) => handleSaveRename(s.id, e)}
                      style={{ color: 'var(--success-color)' }}
                    >
                      <Check size={12} />
                    </button>
                  )}
                </div>
              );
            })}

            {sessions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                Belum ada riwayat diskusi.
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div 
          className={`conversation-chat-area ${isDragging ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ position: 'relative' }}
        >
          {isDragging && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(24, 26, 31, 0.9)', // Matching Odysseus theme slate-dark
              border: '2px dashed var(--accent-color)',
              borderRadius: 'var(--border-radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              pointerEvents: 'none',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--accent-color)' }}>
                <Paperclip size={36} className="animate-bounce" />
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Lepaskan Berkas Di Sini</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mendukung Gambar, PDF, Dokumen Teks, & Slide PPTX (Max 100MB)</p>
              </div>
            </div>
          )}

          {activeSession ? (
            <>
              <div className="chat-area-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div className="chat-area-title">
                  <h3>{activeSession.title}</h3>
                  <p>{activeSession.messages.length} pesan dalam diskusi ini</p>
                </div>

                {/* Team Meeting Selector */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  border: '1px solid var(--border-color)', 
                  padding: '6px 12px', 
                  borderRadius: 'var(--border-radius-md)', 
                  backgroundColor: 'var(--bg-tertiary)',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      type="checkbox" 
                      id="team-meeting-toggle"
                      checked={teamMeetingMode} 
                      onChange={(e) => setTeamMeetingMode(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: 'var(--accent-color)' }}
                    />
                    <label htmlFor="team-meeting-toggle" style={{ fontSize: '11.5px', fontWeight: '700', color: teamMeetingMode ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      👥 Rapat Tim AI
                    </label>
                  </div>

                  {teamMeetingMode && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px', flexWrap: 'wrap' }}>
                      <select 
                        value={meetingAgent1} 
                        onChange={(e) => setMeetingAgent1(e.target.value)}
                        style={{ fontSize: '10.5px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '2px 4px', borderRadius: '4px', outline: 'none' }}
                      >
                        {['Team Brief', 'Team Finansial', 'Team Legal', 'Team Creative', 'Team Riset', 'Team Negosiasi', 'Team Sponsor', 'Team Kampanye', 'Team PR', 'Team Komunitas', 'Team Reporter', 'Team Kesehatan'].map(a => (
                          <option key={a} value={a}>@{a.toLowerCase().replace(/\s+/g, '_')}</option>
                        ))}
                      </select>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>&</span>
                      <select 
                        value={meetingAgent2} 
                        onChange={(e) => setMeetingAgent2(e.target.value)}
                        style={{ fontSize: '10.5px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '2px 4px', borderRadius: '4px', outline: 'none' }}
                      >
                        {['Team Finansial', 'Team Brief', 'Team Legal', 'Team Creative', 'Team Riset', 'Team Negosiasi', 'Team Sponsor', 'Team Kampanye', 'Team PR', 'Team Komunitas', 'Team Reporter', 'Team Kesehatan'].map(a => (
                          <option key={a} value={a}>@{a.toLowerCase().replace(/\s+/g, '_')}</option>
                        ))}
                      </select>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>&</span>
                      <select 
                        value={meetingAgent3} 
                        onChange={(e) => setMeetingAgent3(e.target.value)}
                        style={{ fontSize: '10.5px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '2px 4px', borderRadius: '4px', outline: 'none' }}
                      >
                        <option value="None">- Tanpa Asisten 3 -</option>
                        {['Team Legal', 'Team Brief', 'Team Finansial', 'Team Creative', 'Team Riset', 'Team Negosiasi', 'Team Sponsor', 'Team Kampanye', 'Team PR', 'Team Komunitas', 'Team Reporter', 'Team Kesehatan'].map(a => (
                          <option key={a} value={a}>@{a.toLowerCase().replace(/\s+/g, '_')}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="chat-area-messages">
                {activeSession.messages.map((msg, idx) => (
                  <div key={idx} className={`message-bubble-wrapper ${msg.sender}`}>
                    <span className="message-sender">
                      {msg.sender === 'user' ? (creatorProfile?.name || 'Kreator') : (msg.senderName || 'Manajer Digital')}
                    </span>
                    <div className="message-bubble">
                      {formatMessageText(msg.text)}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginTop: '6px',
                      marginLeft: msg.sender === 'user' ? '0' : '4px',
                      marginRight: msg.sender === 'user' ? '4px' : '0',
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      fontSize: '11px',
                      color: 'var(--text-secondary)'
                    }}>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.text, idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          transition: 'all var(--transition-speed)',
                          fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--accent-color)';
                          e.currentTarget.style.backgroundColor = 'var(--accent-light)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Copy size={11} />
                        <span>{copiedMsgIdx === idx ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                      
                      {msg.sender === 'assistant' && addPipelineTask && (
                        <button
                          type="button"
                          onClick={() => handleSaveMessageToPipeline(msg.text)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            transition: 'all var(--transition-speed)',
                            fontFamily: 'inherit'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--success-color)';
                            e.currentTarget.style.backgroundColor = 'var(--success-light)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Plus size={11} />
                          <span>Simpan ke Alur Kerja</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && thinkingStatus && (
                  <div className="message-bubble-wrapper assistant">
                    <span className="message-sender">Manajer Digital</span>
                    <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.9 }}>
                      <RefreshCw className="animate-spin" size={13} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', transition: 'all 0.3s ease' }}>{thinkingStatus}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-area-input-container" style={{ position: 'relative' }}>
                {/* File input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept="image/*,text/plain,application/json,text/csv,text/markdown,application/pdf,.pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                />

                {/* Attachment Preview */}
                {attachedFile && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '8px 12px', 
                    background: 'var(--bg-primary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--border-radius-md)', 
                    marginBottom: '10px' 
                  }}>
                    {attachedFilePreview ? (
                      <img 
                        src={attachedFilePreview} 
                        alt="attachment-preview" 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                      />
                    ) : (
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '4px', 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'var(--accent-color)' 
                      }}>
                        <FileText size={18} />
                      </div>
                    )}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{attachedFile.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{(attachedFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleRemoveAttachment} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {showMentionDropdown && filteredMentionAgents.length > 0 && (
                  <div className="mention-autocomplete-dropdown">
                    <div className="mention-autocomplete-header">
                      <span>Pilih Asisten Spesialis</span>
                      <span style={{ fontSize: '9px', fontWeight: 'normal', textTransform: 'none' }}>↑↓ Navigasi, Enter Pilih</span>
                    </div>
                    {filteredMentionAgents.map(([key, role], idx) => {
                      const isActive = idx === activeMentionIdx;
                      const initials = role.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                      
                      return (
                        <div
                          key={key}
                          onClick={() => handleSelectAgentMention(key)}
                          className={`mention-agent-item ${isActive ? 'active' : ''}`}
                          onMouseEnter={() => {
                            setActiveMentionIdx(idx);
                          }}
                        >
                          <div className="mention-agent-avatar">
                            {initials}
                          </div>

                          <div className="mention-agent-info">
                            <span className="mention-agent-role">
                              {role}
                            </span>
                            <span className="mention-agent-handle">
                              {key}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                  className="chat-input-form"
                >
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ height: '38px', padding: '0 12px', flexShrink: 0 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || uploadingFile}
                    title="Lampirkan foto atau dokumen"
                  >
                    {uploadingFile ? <RefreshCw className="animate-spin" size={14} /> : <Paperclip size={14} />}
                  </button>

                  <textarea 
                    ref={textareaRef}
                    className="chat-input-textarea"
                    placeholder={uploadingFile ? "Membaca berkas..." : "Tulis pesan atau pertanyaan ke manajer digital Anda..."}
                    value={inputText}
                    onChange={handleInputChange}
                    onSelect={handleTextareaSelect}
                    onKeyDown={handleKeyDown}
                    disabled={loading || uploadingFile}
                    rows="1"
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ height: '38px', padding: '0 16px', flexShrink: 0 }}
                    disabled={loading || uploadingFile || (!inputText.trim() && !attachedFile)}
                  >
                    <Send size={14} />
                  </button>
                </form>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '8px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ fontWeight: '600', color: 'var(--accent-color)' }}>Tips Mentions:</span>
                  <span>Ketik</span>
                  {['@team_legal', '@team_riset', '@team_kampanye'].map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputText(prev => {
                          const space = prev && !prev.endsWith(' ') ? ' ' : '';
                          return `${prev}${space}${m.toLowerCase()} `;
                        });
                      }}
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '10.5px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'all var(--transition-speed)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-color)';
                        e.currentTarget.style.color = 'var(--accent-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                    >
                      {m}
                    </button>
                  ))}
                  <span>untuk berdiskusi dengan agen spesialis secara langsung.</span>
                </div>

                {activeSession.messages.length === 1 && !attachedFile && (
                  <div className="chat-suggestions">
                    {SUGGESTIONS.map((sug, i) => (
                      <button 
                        key={i} 
                        className="suggestion-chip"
                        onClick={() => handleSend(sug)}
                        disabled={loading}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-icon-wrapper">
                <MessageCircle size={28} />
              </div>
              <h3>Ruang Diskusi Manajer</h3>
              <p>Mulai diskusi baru untuk bernegosiasi dengan brand, memecahkan masalah revisi konten, merancang ide kampanye, atau berkonsultasi mengenai karir digital Anda.</p>
              <button className="btn btn-primary" onClick={handleCreateSession}>
                + Mulai Diskusi Baru
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversation;
