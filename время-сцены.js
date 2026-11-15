export function createSceneClock(){
  let elapsed=0,last=null;
  return {
    step(now,running=true){if(last===null)last=now;const delta=Math.min(Math.max((now-last)/1000,0),.1);last=now;if(running)elapsed+=delta;return elapsed;},
    reset(){elapsed=0;last=null;}
  };
}
