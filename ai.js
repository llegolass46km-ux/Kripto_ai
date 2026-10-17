import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
const loadBtn=document.getElementById("loadAI");
const runBtn=document.getElementById("runAI");
const statusEl=document.getElementById("aiStatus");
const outputEl=document.getElementById("aiOutput");
let generator=null;
const MODEL="onnx-community/Qwen2.5-0.5B-Instruct";
loadBtn.addEventListener("click",async()=>{
 if(generator)return;
 loadBtn.disabled=true;statusEl.textContent="Yapay zekâ kitaplığı yükleniyor… İlk kullanımda model dosyaları indirilecek.";
 try{
  // Browser downloads only model files required for this model; keep cache enabled for repeat visits.
  env.allowRemoteModels=true;
  const device=(navigator.gpu ? "webgpu" : "wasm");
  statusEl.textContent=`Model yükleniyor (${device.toUpperCase()}). İlk indirme uzun sürebilir; sayfayı kapatmayın.`;
  generator=await pipeline("text-generation",MODEL,{device,dtype:"q4"});
  runBtn.disabled=false;
  statusEl.textContent=`Model hazır (${device.toUpperCase()}). Model bu cihazda çalışıyor.`;
  outputEl.textContent="Model yüklendi. “Verileri yorumla” düğmesine bas.";
 }catch(err){
  generator=null;
  statusEl.textContent="Model yüklenemedi: "+(err?.message||String(err))+". İnternet, cihaz belleği ve WebGPU uyumluluğunu kontrol edin.";
 }finally{loadBtn.disabled=false;loadBtn.textContent=generator?"Model yüklendi":"Yeniden dene";}
});
runBtn.addEventListener("click",async()=>{
 const s=window.getKriptoAISnapshot?.();
 if(!s){statusEl.textContent="Önce piyasa verilerinin yüklenmesini bekleyin.";return;}
 if(!generator){statusEl.textContent="Önce AI modelini yükleyin.";return;}
 runBtn.disabled=true;statusEl.textContent="AI piyasa verilerini yorumluyor…";
 const prompt=`Sen dikkatli bir kripto piyasa analisti yardımcısısın. Türkçe yanıt ver. Yalnızca verilen sayısal verilere dayan; eksik verileri uydurma. Kesin gelecek fiyatı, al/sat emri veya garanti verme. Göstergeleri açıklayıp belirsizliği belirt. Çıktıyı şu başlıklarla kısa tut: 1) Verinin özeti 2) Göstergelerin anlamı 3) Olası senaryolar (kesin tahmin değil) 4) İzlenmesi gereken riskler.\n\nPiyasa verileri JSON:\n${JSON.stringify(s)}\n\nAnaliz:`;
 try{
  const result=await generator(prompt,{max_new_tokens:220,do_sample:false,return_full_text:false});
  let answer=result?.[0]?.generated_text;
  if(Array.isArray(answer)) answer=answer.map(x=>x.text||"").join("");
  outputEl.textContent=(answer||"Model boş yanıt döndürdü.").trim();
  statusEl.textContent="Analiz tamamlandı. Üretilen yorum hatalı olabilir; verileri ayrıca kontrol edin.";
 }catch(err){statusEl.textContent="Analiz hatası: "+(err?.message||String(err));}
 finally{runBtn.disabled=false;}
});
