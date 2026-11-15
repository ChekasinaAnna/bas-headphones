if(location.hostname==='127.0.0.1'){
  const report=(status,error,detail='')=>fetch('/__bas_debug',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status,error:String(error).slice(0,400),detail:String(detail).slice(0,200)})}).catch(()=>{});
  addEventListener('error',event=>{if(event.message)report('runtime-error',event.message,`${(event.filename||'').split('/').pop()}:${event.lineno||0}`);});
  addEventListener('unhandledrejection',event=>report('runtime-rejection',event.reason?.message||String(event.reason)));
}
