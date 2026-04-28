export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
    const { title, author, focus } = req.body;
      if (!title) return res.status(400).json({ error: 'title required' });

        const prompt = `あなたは著名な文学研究者です。以下の書籍について大学院レベルの分析をしてください。\n書籍: ${title}\n著者: ${author||'不明'}\n${focus?`焦点: ${focus}`:''}
        以下のJSON形式のみで回答（余分なテキスト不要）:
        {"found":true,"genre":"ジャンル","year":"出版年","country":"国","period":"文学運動","overview":"300文字のあらすじ","authorBio":"著者背景150文字","historicalContext":"時代背景200文字","structure":{"overview":"構成150文字","acts":[{"label":"序盤","title":"タイトル","summary":"展開200文字","significance":"意義80文字"},{"label":"中盤","title":"タイトル","summary":"展開200文字","significance":"意義80文字"},{"label":"終盤","title":"タイトル","summary":"展開200文字","significance":"意義80文字"}]},"characters":[{"name":"名前","role":"役割","initials":"頭文字","description":"説明120文字","academicNote":"批評60文字"},{"name":"名前2","role":"役割","initials":"頭文字","description":"説明","academicNote":"批評"},{"name":"名前3","role":"役割","initials":"頭文字","description":"説明","academicNote":"批評"}],"themes":[{"name":"テーマ1","analysis":"150文字"},{"name":"テーマ2","analysis":"150文字"},{"name":"テーマ3","analysis":"150文字"},{"name":"テーマ4","analysis":"150文字"}],"literaryTechniques":[{"technique":"技法1","usage":"説明100文字"},{"technique":"技法2","usage":"説明"},{"technique":"技法3","usage":"説明"}],"symbolism":[{"symbol":"象徴1","meaning":"意味100文字"},{"symbol":"象徴2","meaning":"意味"},{"symbol":"象徴3","meaning":"意味"}],"criticalPerspectives":[{"school":"精神分析批評","analysis":"120文字"},{"school":"マルクス主義批評","analysis":"120文字"},{"school":"フェミニズム批評","analysis":"120文字"},{"school":"実存主義批評","analysis":"120文字"}],"comparativeLiterature":"比較文学150文字","reception":"受容史150文字","quotablePassages":[{"text":"一節1","analysis":"意義60文字"},{"text":"一節2","analysis":"意義60文字"},{"text":"一節3","analysis":"意義60文字"}],"thesisIdeas":["論文案1 80文字","論文案2 80文字","論文案3 80文字"],"suggestedReferences":["参考文献1","参考文献2","参考文献3","参考文献4"],"keywords":["kw1","kw2","kw3","kw4","kw5","kw6"]}
        もし作品が見つからない場合は{"found":false}のみ返してください。`;

          try {
              const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                          headers: {
                                  'Content-Type': 'application/json',
                                          'x-api-key': process.env.ANTHROPIC_API_KEY,
                                                  'anthropic-version': '2023-06-01',
                                                        },
                                                              body: JSON.stringify({
                                                                      model: 'claude-opus-4-5-20251101',
                                                                              max_tokens: 4000,
                                                                                      messages: [{ role: 'user', content: prompt }],
                                                                                            }),
                                                                                                });
                                                                                                    const data = await response.json();
                                                                                                        const raw = data.content.map((i) => i.text || '').join('');
                                                                                                            const clean = raw.replace(/```json|```/g, '').trim();
                                                                                                                return res.status(200).json(JSON.parse(clean));
                                                                                                                  } catch (e) {
                                                                                                                      console.error(e);
                                                                                                                          return res.status(500).json({ error: 'Analysis failed' });
                                                                                                                            }
                                                                                                                            }
