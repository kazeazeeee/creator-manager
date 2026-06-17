// Gemini API Integration Module

const callGeminiAPI = async (prompt, apiKey, expectJson = false) => {
  if (!apiKey) {
    throw new Error('API Key Gemini tidak ditemukan. Harap masukkan API Key di menu Setelan.');
  }

  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  if (expectJson) {
    body.generationConfig = {
      responseMimeType: 'application/json'
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `HTTP error! status: ${response.status}`;
    throw new Error(errMsg);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('Respons kosong diterima dari Gemini API.');
  }

  if (expectJson) {
    try {
      return JSON.parse(text.trim());
    } catch (e) {
      console.error('Gagal memproses JSON dari Gemini:', text);
      throw new Error('Respons AI tidak dalam format JSON yang valid.');
    }
  }

  return text.trim();
};

// 1. Briefing Analyzer
export const analyzeBriefAPI = async (briefText, apiKey) => {
  const prompt = `
Anda adalah Manajer Digital profesional untuk konten kreator.
Tugas Anda adalah menafsirkan draf/teks briefing kampanye dari brand secara sangat teliti.
Ekstrak semua informasi penting di bawah ini dan kembalikan hasilnya dalam format JSON yang valid dengan struktur berikut:

{
  "brand": "Nama Brand/Klien",
  "projectName": "Nama Kampanye/Proyek (singkat)",
  "deliverables": "Rangkuman singkat deliverables (misal: 1x Reels, 3x Stories)",
  "doList": ["tugas/hal wajib dilakukan 1", "tugas/hal wajib dilakukan 2", ...],
  "dontList": ["pantangan/hal dilarang 1", "pantangan/hal dilarang 2", ...],
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "mentions": ["@usernameklien1", ...],
  "dueDate": "YYYY-MM-DD (format tanggal tenggat waktu utama jika ada di teks brief. Gunakan tanggal saat ini jika tidak ada. Format wajib YYYY-MM-DD)"
}

Teks brief:
"""
${briefText}
"""
`;
  return callGeminiAPI(prompt, apiKey, true);
};

// 2. Contract Gotcha Finder
export const analyzeContractAPI = async (contractText, apiKey) => {
  const prompt = `
Anda adalah Manajer Hukum & Bisnis Digital untuk konten kreator.
Tugas Anda adalah memindai teks kontrak kerja sama / sponsorship di bawah ini dan mengidentifikasi potensi jebakan (gotchas) atau risiko tersembunyi.
Ekstrak poin penting dan kembalikan hasilnya dalam format JSON yang valid dengan struktur berikut:

{
  "hasExclusivity": true/false (apakah ada pasal eksklusivitas?),
  "exclusivityDetails": "Penjelasan detail durasi dan lingkup eksklusivitas (misal: tidak boleh kerja sama dengan brand skincare lain selama 3 bulan)",
  "paymentTerms": "Termin dan ketentuan pembayaran (misal: NET 60 hari setelah invoice)",
  "paymentRisk": "low" / "medium" / "high" (risiko term pembayaran bagi kreator),
  "usageRights": "Hak penggunaan aset konten (misal: brand boleh menggunakan video untuk iklan berbayar di media sosial selama 1 tahun)",
  "usageRightsRisk": "low" / "medium" / "high" (risiko hak cipta / penggunaan aset bagi kreator),
  "otherRisks": [
    {
      "title": "Judul risiko (misal: Denda Keterlambatan)",
      "description": "Deskripsi risiko dari pasal kontrak"
    }
  ],
  "negotiationSuggestions": "Saran tertulis untuk membalas/menegosiasikan ulang pasal-pasal yang merugikan tersebut."
}

Teks kontrak:
"""
${contractText}
"""
`;
  return callGeminiAPI(prompt, apiKey, true);
};

// 3. Client Communicator (Email/WA Draft Generator)
export const generateDraftAPI = async (scenario, tone, details, creatorProfile, apiKey) => {
  const prompt = `
Anda adalah Manajer Digital profesional yang mewakili Kreator bernama "${creatorProfile.name}" (akun: ${creatorProfile.handle}).
Tugas Anda adalah menulis draf balasan untuk Klien/Brand.
Gunakan skenario: "${scenario}"
Gunakan nada bicara (tone): "${tone}"
Detail spesifik untuk draf: "${details}"
Informasi tambahan profil kreator (jika relevan): Rate standard ${creatorProfile.rates} (${creatorProfile.currency}).

Buat draf pesan yang elegan, siap pakai, profesional, dan efektif untuk memenangkan negosiasi atau menegaskan poin kreator. 
Tulis balasan langsung tanpa kalimat pengantar dari Anda di awal/akhir draf. Anda adalah manajer kreator (gunakan subjek orang pertama jamak "kami" atau "manajemen ${creatorProfile.name}").
`;
  return callGeminiAPI(prompt, apiKey, false);
};

// 4. Chat Asisten Digital Manager
export const chatWithManagerAPI = async (messageHistory, apiKey) => {
  const messagesFormatted = messageHistory.map(msg => {
    return `${msg.sender === 'user' ? 'Kreator' : 'Manajer Digital (Anda)'}: ${msg.text}`;
  }).join('\n');

  const prompt = `
Anda adalah "Manajer Digital" pribadi yang cerdas, minimalis, suportif, dan profesional untuk seorang konten kreator.
Tugas Anda adalah membantu menjawab pertanyaan mereka seputar bisnis kreator, sponsorship, negosiasi rate card, ide konten, manajemen waktu, dan masalah klien.

Tanggapi pesan terakhir kreator dalam riwayat percakapan di bawah dengan nada bicara yang ramah, ringkas, solutif, dan asertif. Jaga agar tanggapan Anda tetap minimalis, to-the-point, dan berwawasan praktis bisnis.

Riwayat Percakapan:
${messagesFormatted}

Tanggapan Baru Anda (Langsung ke draf balasan tanpa pengantar meta):
`;
  return callGeminiAPI(prompt, apiKey, false);
};
