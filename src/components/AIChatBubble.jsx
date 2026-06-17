import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, RefreshCw } from 'lucide-react';
import { apiChatWithManager } from '../utils/api';

const AIChatBubble = ({ apiKey, creatorProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Halo ${creatorProfile?.name || 'Kreator'}! Saya adalah Manajer Digital Anda. Ada yang bisa saya bantu hari ini? Anda bisa meminta saya mengoreksi draf balasan email, merencanakan ide konten, atau menafsirkan negosiasi brand.`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage = { sender: 'user', text: inputText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      if (!apiKey) {
        // Simulated response if no API Key is set
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        let reply = `Tentu! Saya siap membantu. Namun, agar saya bisa berpikir secara dinamis menggunakan kecerdasan buatan SumoPod, mohon masukkan API Key SumoPod Anda di menu Setelan terlebih dahulu.`;
        
        const textLower = userMessage.text.toLowerCase();
        if (textLower.includes('harga') || textLower.includes('rate card') || textLower.includes('nawar')) {
          reply = `Menarik! Untuk negosiasi rate card, sebaiknya Anda menawarkan kompromi. Misal, jika brand menawar harga dari Rp5.000.000 menjadi Rp3.000.000, Anda bisa tawarkan harga Rp4.000.000 dengan menghapus deliverables Instastory. Ingin saya buatkan draf email penawarannya? (Buka halaman 'Draf Komunikasi' untuk otomatis membuatnya!)`;
        } else if (textLower.includes('revisi') || textLower.includes('klien bawel')) {
          reply = `Menghadapi permintaan revisi berlebih memang melelahkan. Periksa brief awal kampanye Anda di halaman 'Analisis Brief' untuk memastikan apakah revisi yang mereka minta sesuai kesepakatan atau tidak. Jika tidak, Anda berhak mengenakan biaya revisi tambahan (reshoot fee) sebesar 20-30% dari total nilai proyek.`;
        } else if (textLower.includes('halo') || textLower.includes('hi') || textLower.includes('pagi') || textLower.includes('siang')) {
          reply = `Halo! Saya siap mendampingi operasional kreatif Anda hari ini. Ada tawaran sponsorship masuk, kontrak yang ingin diperiksa, atau brief yang harus diuraikan?`;
        }
        
        setMessages([...updatedMessages, { sender: 'assistant', text: reply }]);
      } else {
        const res = await apiChatWithManager(updatedMessages);
        const assistantReply = res.reply;
        setMessages([...updatedMessages, { sender: 'assistant', text: assistantReply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...updatedMessages, { 
        sender: 'assistant', 
        text: `Maaf, saya mengalami kesalahan saat menghubungi pusat kendali AI: ${err.message}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="floating-ai-widget no-print">
      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-title">
              <div className="chat-status" />
              <div>
                <h4>Digital Manager</h4>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Online</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-msg assistant" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw className="animate-spin" size={12} />
                <span>Sedang menulis...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-input-area">
            <input 
              type="text" 
              placeholder="Tulis pesan ke manajer..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '8px 12px', border: 'none', borderRadius: 'var(--border-radius-md)' }}
              disabled={loading || !inputText.trim()}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Tanya Manager AI"
      >
        <Sparkles size={22} />
      </button>
    </div>
  );
};

export default AIChatBubble;
