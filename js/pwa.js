(function(){
  const installBox=document.getElementById('pwaInstall');
  const installNow=document.getElementById('pwaInstallNow');
  const installLater=document.getElementById('pwaInstallLater');
  const offline=document.getElementById('pwaOffline');
  let deferredPrompt=null;

  function updateOnline(){
    if(offline) offline.classList.toggle('hidden', navigator.onLine);
  }
  window.addEventListener('online', updateOnline);
  window.addEventListener('offline', updateOnline);
  updateOnline();

  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./service-worker.js').catch(function(err){
        console.warn('Service Worker konnte nicht registriert werden:', err);
      });
    });
  }

  window.addEventListener('beforeinstallprompt', function(event){
    event.preventDefault();
    deferredPrompt=event;
    if(installBox && localStorage.getItem('atms_pwa_install_later')!=='1') installBox.classList.remove('hidden');
  });

  if(installNow) installNow.addEventListener('click', async function(){
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt=null;
    installBox.classList.add('hidden');
  });
  if(installLater) installLater.addEventListener('click', function(){
    localStorage.setItem('atms_pwa_install_later','1');
    installBox.classList.add('hidden');
  });
  window.addEventListener('appinstalled', function(){
    deferredPrompt=null;
    if(installBox) installBox.classList.add('hidden');
  });
})();
