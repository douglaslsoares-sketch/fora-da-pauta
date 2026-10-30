"use strict";
(() => {
 const iniciar=document.getElementById("iniciar"),parar=document.getElementById("parar"),baixar=document.getElementById("baixar"),escuta=document.getElementById("escuta"),status=document.getElementById("status");
 let stream=null,recorder=null,blob=null,url=null,files=[];
 function informar(s){status.textContent=s;}
 function limparStream(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}}
 function pararGravacao(){if(recorder&&recorder.state!=="inactive")recorder.stop();else limparStream();}
 iniciar.addEventListener("click", async ()=>{
   if(!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder==="undefined"){informar("Este Chrome não oferece captura de áudio da aba.");return;}
   if(url){URL.revokeObjectURL(url);url=null;}blob=null;files=[];baixar.disabled=true;escuta.removeAttribute("src");
   try{
     stream=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:"browser"},audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},preferCurrentTab:false,selfBrowserSurface:"exclude",surfaceSwitching:"exclude"});
     if(stream.getVideoTracks()[0]?.getSettings().displaySurface!=="browser"){
       informar("Captura cancelada: selecione exclusivamente uma ABA do Chrome.");limparStream();return;
     }
     if(stream.getAudioTracks().length!==1){informar("Nenhum áudio da aba recebido. Marque Compartilhar áudio da aba e tente de novo.");limparStream();return;}
     const mime=["audio/webm;codecs=opus","video/webm;codecs=opus","video/webm"].find(x=>MediaRecorder.isTypeSupported(x));
     if(!mime){informar("Nenhum formato de gravação compatível encontrado.");limparStream();return;}
     const somenteAudio=new MediaStream(stream.getAudioTracks());
     recorder=new MediaRecorder(somenteAudio,{mimeType:mime});
     recorder.ondataavailable=e=>{if(e.data.size)files.push(e.data);};
     recorder.onerror=()=>{informar("Erro na gravação.");limparStream();parar.disabled=true;iniciar.disabled=false;};
     recorder.onstop=()=>{blob=new Blob(files,{type:mime});limparStream();parar.disabled=true;iniciar.disabled=false;if(blob.size>1024){url=URL.createObjectURL(blob);escuta.src=url;baixar.disabled=false;informar("Gravação pronta. Ouça e clique em Baixar arquivo.");}else informar("Gravação vazia ou curta demais.");};
     stream.getVideoTracks()[0].addEventListener("ended",pararGravacao,{once:true});
     recorder.start(1000);iniciar.disabled=true;parar.disabled=false;informar("Gravando SOMENTE o áudio da aba selecionada. Ao terminar, clique em Parar gravação.");
   }catch(e){limparStream();iniciar.disabled=false;parar.disabled=true;informar(e?.name==="NotAllowedError"?"Permissão não concedida; nenhuma captura iniciada.":"Não foi possível capturar o áudio da aba.");}
 });
 parar.addEventListener("click",pararGravacao);
 baixar.addEventListener("click",()=>{if(!blob)return;const a=document.createElement("a");const nome="fora-da-pauta-voz-01-teste-"+new Date().toISOString().replace(/[:.]/g,"-")+".webm";a.href=url;a.download=nome;a.click();informar("Arquivo solicitado para download. Mantenha-o privado até a revisão.");});
 window.addEventListener("pagehide",()=>{pararGravacao();limparStream();});
})();