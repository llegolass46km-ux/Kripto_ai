const $=id=>document.getElementById(id);
let current=null, prices=[], alertRule=null, lastAlertState=false;
const coinNames={bitcoin:"Bitcoin · BTC",ethereum:"Ethereum · ETH",solana:"Solana · SOL",binancecoin:"BNB",ripple:"XRP",dogecoin:"Dogecoin · DOGE"};
const currencySymbols={usd:"$",try:"₺",eur:"€"};
const fmt=(n,cur=$("currency").value)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:cur.toUpperCase(),maximumFractionDigits:n<1?6:2}).format(n);
const compact=(n,cur=$("currency").value)=>new Intl.NumberFormat("tr-TR",{notation:"compact",maximumFractionDigits:2}).format(n)+" "+cur.toUpperCase();
async function fetchData(){
 $("refresh").textContent="Yükleniyor…"; $("analysis").textContent="Piyasa verileri alınıyor…";
 const id=$("coin").value, cur=$("currency").value, days=$("period").value;
 try{
  const marketUrl=`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${cur}&ids=${id}&price_change_percentage=24h`;
  const chartUrl=`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${cur}&days=${days}`;
  const [mr,cr]=await Promise.all([fetch(marketUrl),fetch(chartUrl)]);
  if(!mr.ok||!cr.ok) throw new Error("API yanıtı "+mr.status+" / "+cr.status+". Biraz sonra tekrar deneyin; erişim sınırı olabilir.");
  const m=await mr.json(), c=await cr.json(); if(!m[0]||!c.prices?.length) throw new Error("Bu varlık için veri bulunamadı.");
  current=m[0]; prices=c.prices.map(x=>x[1]); render();
 }catch(e){$("analysis").textContent="Veri alınamadı: "+e.message+" İnternet bağlantısını kontrol edin. Ücretsiz API sınırları değişebilir."}
 finally{$("refresh").textContent="↻ Yenile"}
}
function ema(data,period){if(data.length<period)return null;let k=2/(period+1),v=data.slice(0,period).reduce((a,b)=>a+b,0)/period;for(let i=period;i<data.length;i++)v=data[i]*k+v*(1-k);return v}
function rsi(data,p=14){if(data.length<=p)return null;let gains=0,losses=0;for(let i=data.length-p;i<data.length;i++){let d=data[i]-data[i-1];if(d>0)gains+=d;else losses-=d}if(losses===0)return 100;return 100-100/(1+gains/losses)}
function render(){
 const cur=$("currency").value, change=current.price_change_percentage_24h||0;
 $("assetName").textContent=coinNames[current.id]||current.name;
 $("price").textContent=fmt(current.current_price,cur);
 $("change").textContent=(change>=0?"+":"")+change.toLocaleString("tr-TR",{maximumFractionDigits:2})+"% · 24 saat";
 $("change").className="change "+(change>=0?"positive":"negative");
 $("marketCap").textContent=compact(current.market_cap,cur);$("volume").textContent=compact(current.total_volume,cur);
 $("high").textContent=fmt(current.high_24h,cur);$("low").textContent=fmt(current.low_24h,cur);
 $("stamp").textContent="Son alınan veri: "+new Date().toLocaleString("tr-TR")+" · Kaynak: CoinGecko";
 const rv=rsi(prices), e12=ema(prices,12),e26=ema(prices,26);
 $("rsi").textContent=rv===null?"Yetersiz veri":rv.toFixed(1);
 $("ema").textContent=e12&&e26?(e12>e26?"12 > 26 · pozitif eğilim":"12 < 26 · negatif eğilim"):"Yetersiz veri";
 const trend=e12&&e26?(e12>e26?"Yukarı eğilim":"Aşağı eğilim"):"Belirsiz";
 $("trend").textContent=trend;
 let parts=[];parts.push(`24 saatlik değişim ${change.toFixed(2)}%.`);
 if(rv!==null)parts.push(rv>=70?"RSI 70 üzerinde: momentum aşırı alım bölgesinde olabilir.":rv<=30?"RSI 30 altında: momentum aşırı satım bölgesinde olabilir.":`RSI ${rv.toFixed(1)}: 30–70 aralığında.`);
 if(e12&&e26)parts.push(e12>e26?"Kısa dönem EMA, uzun dönem EMA'nın üzerinde.":"Kısa dönem EMA, uzun dönem EMA'nın altında.");
 parts.push("Bu göstergeler tek başına alım/satım sinyali değildir; sonuçlar farklı zaman dilimlerinde değişebilir.");
 $("analysis").textContent=parts.join(" ");
 drawChart(prices); checkAlert();
}
function drawChart(data){
 const canvas=$("chart"),ctx=canvas.getContext("2d"),ratio=window.devicePixelRatio||1,w=canvas.clientWidth,h=210;
 canvas.width=w*ratio;canvas.height=h*ratio;ctx.scale(ratio,ratio);ctx.clearRect(0,0,w,h);
 if(data.length<2)return;let min=Math.min(...data),max=Math.max(...data);if(min===max){min*=.99;max*=1.01}
 const pad=12, xstep=(w-pad*2)/(data.length-1);
 ctx.strokeStyle="#344652";ctx.lineWidth=1;
 for(let i=0;i<4;i++){let y=pad+i*(h-pad*2)/3;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke()}
 ctx.beginPath();data.forEach((v,i)=>{let x=pad+i*xstep,y=h-pad-(v-min)/(max-min)*(h-pad*2);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=data.at(-1)>=data[0]?"#4fe0a2":"#ff7185";ctx.lineWidth=2.5;ctx.stroke();
}
function checkAlert(){if(!alertRule||!current)return;const hit=alertRule.condition==="above"?current.current_price>=alertRule.target:current.current_price<=alertRule.target;
 $("alertStatus").textContent=hit?`ALARM: Fiyat ${fmt(current.current_price)} · Hedef ${fmt(alertRule.target)}`:`Alarm aktif: ${alertRule.condition==="above"?"üstüne çıkma":"altına inme"} hedefi ${fmt(alertRule.target)}`;
 if(hit&&!lastAlertState){lastAlertState=true;if("Notification"in window&&Notification.permission==="granted")new Notification("Kripto AI fiyat alarmı",{body:`${coinNames[current.id]}: ${fmt(current.current_price)}`});else alert($("alertStatus").textContent)}
 if(!hit)lastAlertState=false;
}
$("setAlert").onclick=async()=>{const target=Number($("target").value);if(!target||target<=0){$("alertStatus").textContent="Lütfen geçerli hedef fiyat girin.";return}
 alertRule={condition:$("condition").value,target};lastAlertState=false;
 if("Notification"in window&&Notification.permission==="default"){try{await Notification.requestPermission()}catch{}}
 checkAlert();
};
$("refresh").onclick=fetchData;$("coin").onchange=fetchData;$("currency").onchange=fetchData;$("period").onchange=fetchData;
$("report").onclick=()=>{if(!current){$("reportText").hidden=false;$("reportText").textContent="Henüz piyasa verisi yok.";return}
 const text=`KRİPTO AI — PİYASA RAPORU\nTarih: ${new Date().toLocaleString("tr-TR")}\nVarlık: ${current.name} (${current.symbol.toUpperCase()})\nFiyat: ${fmt(current.current_price)}\n24 saat değişim: ${(current.price_change_percentage_24h||0).toFixed(2)}%\nPiyasa değeri: ${compact(current.market_cap)}\n24 saat hacim: ${compact(current.total_volume)}\nRSI(14): ${rsi(prices)?.toFixed(1)??"Yetersiz veri"}\nTrend: ${$("trend").textContent}\nYorum: ${$("analysis").textContent}\n\nKaynak: CoinGecko API\nUyarı: Bilgilendirme amaçlı otomatik teknik özet; yatırım tavsiyesi değildir. Tahmin garantisi vermez.`;
 $("reportText").hidden=false;$("reportText").textContent=text;const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));a.download="kripto-ai-rapor.txt";a.click();URL.revokeObjectURL(a.href)
};
fetchData();setInterval(fetchData,60000);window.addEventListener("resize",()=>prices.length&&drawChart(prices));
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));

// Expose only the current market snapshot to the opt-in local AI module.
window.getKriptoAISnapshot = function(){if(!current)return null;return {name:current.name,symbol:(current.symbol||"").toUpperCase(),price:current.current_price,currency:$("currency").value,change24h:current.price_change_percentage_24h,marketCap:current.market_cap,volume24h:current.total_volume,high24h:current.high_24h,low24h:current.low_24h,rsi:rsi(prices),ema12:ema(prices,12),ema26:ema(prices,26),trend:$("trend").textContent,periodDays:$("period").value,points:prices.length,asOf:new Date().toISOString()}}
