export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { title, author, focus } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const prompt = `あなたは著名な文学研究者です。\n書籍タイトル: ${title}\n著者: ${author || '不明'}\n${focus ? '焦点: ' + focus : ''}\nJSON形式のみで回答（余分なテキスト不要）:\n{"found":true,"genre":"ジャンル","year":"出版年","country":"国","period":"時代区分","overview":"300文字のあらすじ","authorBio":"著者150文字","historicalContext":"文脈200文字","structure":{"overview":"構成150文字","acts":[{"label":"第一部","title":"タイトル","summary":"200文字","significance":"80文字"},{"label":"第二部","title":"タイトル","summary":"200文字","significance":"80文字"},{"label":"第三部","title":"タイトル","summary":"200文字","significance":"80文字"}]},"characters":[{"name":"名前","role":"役割","initials":"頭文字","description":"120文字","academicNote":"60文字"},{"name":"名前2","role":"役割","initials":"頭文字","description":"120文字","academicNote":"60文字"},{"name":"名前3","role":"役割","initials":"頭文字","description":"説明","academicNote":"注"}],"themes":[{"name":"テーマ1","analysis":"150文字"},{"name":"テーマ2","analysis":"150文字"},{"name":"テーマ3","analysis":"150文字"},{"name":"テーマ4","analysis":"150文字"}],"literaryTechniques":[{"technique":"技法名","usage":"100文字"},{"technique":"技法2","usage":"説明"},{"technique":"技法3","usage":"説明"}],"symbolism":[{"symbol":"象徴名","meaning":"100文字"},{"symbol":"象徴2","meaning":"意味"},{"symbol":"象徴3","meaning":"意味"}],"criticalPerspectives":[{"school":"精神分析批評","analysis":"120文字"},{"school":"マルクス主義批評","analysis":"120文字"},{"school":"フェミニズム批評","analysis":"120文字"},{"school":"実存主義批評","analysis":"120文字"}],"comparativeLiterature":"150文字","reception":"150文字","quotablePassages":[{"text":"一節","analysis":"60文字"},{"text":"一節2","analysis":"60文字"},{"text":"一節3","analysis":"60文字"}],"thesisIdeas":["テーマ案1 80文字","テーマ案2 80文字","テーマ案3 80文字"],"suggestedReferences":["参考文献1","参考文献2","参考文献3","参考文献4"],"keywords":["kw1","kw2","kw3","kw4","kw5","kw6"]}\n作品が見つからない場合は {"found": false} のみ`;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://book-analysis-app-jet.vercel.app',
        'X-Title': 'Book Analysis App',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
      }),
    });
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
