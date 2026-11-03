/**
 * Hindi Devanagari transliteration and currency word helper
 */

// Mapping of Devanagari consonants to English phonetics
const consonants: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
  'ष': 'sh', 'स': 's', 'ह': 'h', 'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy',
  'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f', 'ज़': 'z'
};

// Vowel signs (Matras)
const matras: Record<string, string> = {
  'ा': 'a',
  'ि': 'i',
  'ी': 'ee',
  'ु': 'u',
  'ू': 'oo',
  'ृ': 'ri',
  'े': 'e',
  'ै': 'ai',
  'ो': 'o',
  'ौ': 'au',
  'ं': 'n',
  'ः': 'h',
  'ँ': 'n',
  '्': '' // Halant removes implicit vowel
};

// Independent vowels
const vowels: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'an', 'अः': 'ah'
};

// Common direct name overrides for natural high-accuracy Indian names
const knownNames: Record<string, string> = {
  'राजेश': 'Rajesh',
  'कुमार': 'Kumar',
  'अमन': 'Aman',
  'कुशवाहा': 'Kushwaha',
  'राम': 'Ram',
  'प्रसाद': 'Prasad',
  'सुरेश': 'Suresh',
  'यादव': 'Yadav',
  'सुनीता': 'Sunita',
  'देवी': 'Devi',
  'पूजा': 'Pooja',
  'वर्मा': 'Verma',
  'अनिल': 'Anil',
  'सिंह': 'Singh',
  'अमित': 'Amit',
  'गुप्ता': 'Gupta',
  'विशाल': 'Vishal',
  'दीपक': 'Deepak',
  'संजय': 'Sanjay',
  'प्रियंका': 'Priyanka',
  'वृंदावन': 'Vrindavan',
  'कुशीनगर': 'Kushinagar',
  'नौरंगिया': 'Naurangiya',
  'बरगहा': 'Bargaha',
  'पडरौना': 'Padrauna',
  'तमकुही': 'Tamkuhi'
};

/**
 * Transliterates Hindi text to English
 */
export function hindiToEnglish(hindiText: string): string {
  if (!hindiText || !hindiText.trim()) return '';

  const words = hindiText.trim().split(/\s+/);
  const englishWords = words.map(word => {
    // Check known dictionary first
    if (knownNames[word]) return knownNames[word];

    let result = '';
    const chars = Array.from(word);
    const len = chars.length;

    for (let i = 0; i < len; i++) {
      const char = chars[i];
      const nextChar = i + 1 < len ? chars[i + 1] : '';

      if (vowels[char]) {
        result += vowels[char];
      } else if (consonants[char]) {
        const engConsonant = consonants[char];
        if (matras[nextChar] !== undefined) {
          result += engConsonant + matras[nextChar];
          i++; // Skip the matra char
        } else if (nextChar === '्') {
          result += engConsonant;
          i++; // Skip halant
        } else {
          // If at the end of the word, usually implicit 'a' is dropped in modern Hindi (e.g. राम -> Ram not Rama)
          const isEnd = (i === len - 1);
          result += engConsonant + (isEnd ? '' : 'a');
        }
      } else if (matras[char] !== undefined) {
        result += matras[char];
      } else {
        result += char;
      }
    }

    // Capitalize first letter
    if (result.length > 0) {
      return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
    }
    return result;
  });

  return englishWords.join(' ');
}

/**
 * Converts a number into formal Hindi Words (भारतीय मुद्रा शब्द प्रारूप)
 * e.g., 1500 -> "एक हजार पाँच सौ रुपये मात्र"
 */
export function numberToHindiWords(amount: number): string {
  if (isNaN(amount) || amount <= 0) return 'शून्य रुपये मात्र';

  const units = ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
    'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
  const tens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];

  function convertBelowHundred(num: number): string {
    if (num < 20) return units[num];
    const t = Math.floor(num / 10);
    const u = num % 10;
    if (num === 21) return 'इक्कीस';
    if (num === 22) return 'बाईस';
    if (num === 25) return 'पच्चीस';
    if (num === 50) return 'पचास';
    if (num === 75) return 'पचहत्तर';
    return (tens[t] + (u > 0 ? ' ' + units[u] : '')).trim();
  }

  let words = '';
  const num = Math.floor(amount);

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const remainder = num % 100;

  if (crore > 0) {
    words += `${convertBelowHundred(crore)} करोड़ `;
  }
  if (lakh > 0) {
    words += `${convertBelowHundred(lakh)} लाख `;
  }
  if (thousand > 0) {
    words += `${convertBelowHundred(thousand)} हजार `;
  }
  if (hundred > 0) {
    words += `${units[hundred]} सौ `;
  }
  if (remainder > 0) {
    words += convertBelowHundred(remainder) + ' ';
  }

  return `${words.trim()} रुपये मात्र`;
}

/**
 * Format date to standard Indian DD-MM-YYYY format
 */
export function formatDateDDMMYYYY(dateInput: string | Date): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format currency to Indian Rupees (₹)
 */
export function formatINR(val: number): string {
  if (isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
}
