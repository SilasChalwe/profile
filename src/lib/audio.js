// Original, noise-based interface sound design. No tonal beep oscillators.
export class PortfolioAudio {
  constructor(){
    this.context=null;
    this.ambientSource=null;
    this.ambientGain=null;
    this.effectsEnabled=true;
    this.ambientEnabled=false;
    this.lastHover=0;
  }

  ensure(){
    if(typeof window==='undefined')return null;
    const AudioContextCtor=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextCtor)return null;
    if(!this.context)this.context=new AudioContextCtor();
    if(this.context.state==='suspended')this.context.resume().catch(()=>{});
    return this.context;
  }

  noise(seconds=1){
    const ctx=this.ensure();
    if(!ctx)return null;
    const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*seconds),ctx.sampleRate);
    const data=buffer.getChannelData(0);
    // A little correlated noise sounds more like cloth, air and mechanisms than a synth beep.
    let previous=0;
    for(let i=0;i<data.length;i++){
      const white=Math.random()*2-1;
      previous=(previous+white*.22)/1.18;
      data[i]=previous*.6+white*.4;
    }
    return buffer;
  }

  burst({duration=.16,cutoff=950,volume=.08,highpass=false,delay=0,rate=1}={}){
    const ctx=this.ensure();
    if(!ctx)return;
    const source=ctx.createBufferSource();
    source.buffer=this.noise(Math.max(duration*.95,.11));
    source.playbackRate.value=rate;
    const filter=ctx.createBiquadFilter();
    filter.type=highpass?'highpass':'lowpass';
    filter.frequency.value=cutoff;
    const gain=ctx.createGain();
    const at=ctx.currentTime+delay;
    gain.gain.setValueAtTime(.00001,at);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume),at+Math.min(.018,duration*.15));
    gain.gain.exponentialRampToValueAtTime(.00001,at+duration);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(at);
    source.stop(at+duration+.01);
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }

  play(type='select'){
    if(!this.effectsEnabled)return;
    if(type==='hover'){
      const time=Date.now();
      if(time-this.lastHover<220)return;
      this.lastHover=time;
      this.burst({duration:.045,cutoff:1800,volume:.016,highpass:true});
    }else if(type==='open'){
      this.burst({duration:.38,cutoff:1600,volume:.052,highpass:true});
      this.burst({duration:.085,cutoff:750,volume:.06,delay:.07});
    }else if(type==='travel'){
      this.burst({duration:.57,cutoff:1900,volume:.045,highpass:true});
      this.burst({duration:.18,cutoff:320,volume:.035,delay:.21});
    }else if(type==='close'){
      this.burst({duration:.15,cutoff:800,volume:.043,highpass:true});
    }else if(type==='enter'){
      this.burst({duration:.67,cutoff:1500,volume:.05,highpass:true});
      this.burst({duration:.15,cutoff:520,volume:.06,delay:.18});
    }else{
      this.burst({duration:.048,cutoff:2600,volume:.046,highpass:true});
      this.burst({duration:.1,cutoff:620,volume:.043,delay:.012});
    }
  }

  // Maintain compatibility with the previous portfolio API.
  click(){this.play('select');}

  setAmbient(enabled){
    this.ambientEnabled=!!enabled;
    const ctx=this.ensure();
    if(!ctx)return;
    if(enabled&&!this.ambientSource){
      const source=ctx.createBufferSource();
      source.buffer=this.noise(3.2);
      source.loop=true;
      const filter=ctx.createBiquadFilter();
      filter.type='lowpass';
      filter.frequency.value=210;
      const gain=ctx.createGain();
      gain.gain.setValueAtTime(.00001,ctx.currentTime);
      gain.gain.linearRampToValueAtTime(.018,ctx.currentTime+1.3);
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      this.ambientSource=source;
      this.ambientGain=gain;
      this.ambientFilter=filter;
    }else if(!enabled&&this.ambientSource){
      const source=this.ambientSource;
      const gain=this.ambientGain;
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(.00001,ctx.currentTime,.16);
      source.stop(ctx.currentTime+.75);
      source.onended=()=>{source.disconnect();gain.disconnect();this.ambientFilter?.disconnect();};
      this.ambientSource=null;this.ambientGain=null;
    }
  }
}
export const portfolioAudio=new PortfolioAudio();
