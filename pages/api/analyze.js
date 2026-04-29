export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { title, author, focus } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const prompt = `あなたは著名な文学研究者です。以下の書籍を分析してください。\n書籍: ${title} / 著者: ${author||'不明'}\n${focus?'焦点: '+focus:''}\nJSON形式のみで回答:\n{"found":true,"genre":"ジャンル","year":"出版年","country":"国","period":"時代","overview":"あらすじ200文字","authorBio":"著者100文字","historicalContext":"背景150文字","structure":{"overview":"構成100文字","acts":[{"label":"序盤","title":"題","summary":"100文字","significance":"60文字"},{"label":"中盤","title":"題","summary":"100文字","significance":"60文字"},{"label":"終盤","title":"題","summary":"100文字","significance":"60文字"}]},"characters":[{"name":"名","role":"役","initials":"頭","description":"80文字","academicNote":"40文字"},{"name":"名2","role":"役","initials":"頭","description":"説明","academicNote":"注"},{"name":"名3","role":"役","initials":"頭","description":"説明","academicNote":"注"}],"themes":[{"name":"テーマ1","analysis":"80文字"},{"name":"テーマ2","analysis":"80文字"},{"name":"テーマ3","analysis":"80文字"}],"literaryTechniques":[{"technique":"技法","usage":"60文字"},{"technique":"技法2","usage":"説明"}],"symbolism":[{"symbol":"象徴","meaning":"60文字"},{"symbol":"象徴2","meaning":"意味"}],"criticalPerspectives":[{"school":"精神分析","analysis":"80文字"},{"school":"社会批評","analysis":"80文字"},{"school":"フェミニズム","analysis":"80文字"}],"comparativeLiterature":"80文字","reception":"80文字","quotablePassages":[{"text":"一節","analysis":"40文字"},{"text":"一節2","analysis":"注"}],"thesisIdeas":["案1","案2","案3"],"suggestedReferences":["文献1","文献2","文献3"],"keywords":["kw1","kw2","kw3","kw4","kw5"]}\n作品不明の場合のみ{"found":false}`;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.3,maxOutputTokens:3000}})});
    const d = await r.json();
    if(d.error) return res.status(500).json({error:'Gemini: '+d.error.message});
    const raw = d.candidates?.[0]?.content?.parts?.[0]?.text||'';
    const m = raw.match(/\{[\s\S]*\}/);
    if(!m) return res.status(500).json({error:'No JSON'});
    return res.status(200).json(JSON.parse(m[0]));
  } catch(e) {
    return res.status(500).json({error:e.message});
  }
}
