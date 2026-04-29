export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { title, author, focus } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  const prompt = `あなたは著名な文学研究者・比較文学の教授です。

書籍タイトル: ${title}
著者: ${author || '不明'}
${focus ? `論文の焦点: ${focus}` : ''}

以下のJSON形式のみで回罗してください。余分なテキストやマークダウン記号は不要です:
{"found":true,"genre":"ジャンル","year":"出版年","country":"国・言語","period":"時代区分","overview":"あらすじ300文字","authorBio":"著者150文字","historicalContext":"時代背景200文字","structure":{"overview":"構成150文字","acts":[{"label":"第一部","title":"タイトル","summary":"展開150文字","significance":"意義60文字"},{"label":"第二部","title":"タイトル","summary":"展開150文字","significance":"意義60文字"},{"label":"第三部","title":"タイトル","summary":"展開150文字","significance":"意義60文字"}]},"characters":[{"name":"名前","role":"役割","initials":"頭文字","description":"説明100文字","academicNote":"注50文字"},{"name":"名前2","role":"役割","initials":"頭","description":"説明","academicNote":"注"},{"name":"名前3","role":"役割","initials":"頭","description":"説明","academicNote":"注"}],"themes":[{"name":"テーマ1","analysis":"分析100文字"},{"name":"テーマ2","analysis":"分析100文字"},{"name":"テーマ3","analysis":"分析100文字"}],"literaryTechniques":[{"technique":"技法名","usage":"説明80文字"},{"technique":"技法2","usage":"説明"}],"symbolism":[{"symbol":"象徴名","meaning":"意味80文字"},{"symbol":"象徴2","meaning":"意味"}],"criticalPerspectives":[{"school":"精神分析批評","analysis":"分析100文字"},{"school":"社会批評","analysis":"分析100文字"},{"school":"フェミニズム批評","analysis":"分析100文字"}],"comparativeLiterature":"比較文学100文字","reception":"受容史100文字","quotablePassages":[{"text":"印象的な一節","analysis":"意義50文字"},{"text":"一節2","analysis":"意義"}],"thesisIdeas":["論文テーマ案1","論文テーマ案2","論文テーマ案3"],"suggestedReferences":["参考文献1","参考文献2","参考文献3"],"keywords":["kw1","kw2","kw3","kw4","kw5"]}
作品が見つからない場合は {"found":false} を返してください。`;

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
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error('OpenRouter error:', data.error);
      return res.status(500).json({ error: 'API error: ' + data.error.message });
    }
    const raw = data.choices?.[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'No JSON in response' });
    const parsed = JSON.parse(match[0]);
    return res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Analysis failed: ' + e.message });
  }
}
