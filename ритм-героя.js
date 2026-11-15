// Контакт ног с подиумом: измеренные кадры 93 и 112 исходного ролика, 24 кадра/с.
export const landings=[93/24,112/24];
export function floorWave(time,index,atlas=false){
  const loopTime=((time%8)+8)%8;
  const impact=landings[Math.floor(index/3)];
  const start=(atlas?Math.ceil(impact*12)/12:impact)+(index%3)*.12;
  const age=loopTime-start,duration=1.15;
  return {visible:age>=0&&age<duration,scale:.65+Math.max(0,age)*1.25,
    opacity:age>=0&&age<duration?.28*Math.min(1,age/.06)*(1-age/duration):0};
}
