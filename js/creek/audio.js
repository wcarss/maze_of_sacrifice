class Audio {
  constructor() {
    this.creek = null;
    this.clips = null;
    this.default_volume = 1;
    // TODO: maybe support the below -- no such thing as a config object in new creek at this point
    // this.default_volume = creek.get('config')['default_volume'] || 1;

    this.resource_manager = null;
    this.currently_paused = [];
    this.all_muted = false;
  }

  init(creek) {
    console.log("AudioManager init.");
    this.creek = creek;
    // this.resource_manager = creek.get('resource');
    this.load_clips(creek.get("resources").get_sounds());
  }

  get_clip(clip_id) {
    let sounds = null;
    /* Pulling the below out. Not sure if I want creek to work this way any more.
     *
     *  if (clips === null) {
     *    sounds = this.resource_manager.get_resources()['sound'];
     *    if (!sounds || empty_dict(sounds)) {
     *      console.log("clips haven't loaded yet!");
     *      return null;
     *    } else {
     *      this.load_clips(sounds);
     *    }
     *  }
     *
     */

    if (!this.clips[clip_id]) {
      console.log(
        "attempting to get clip: " + clip_id + " that wasn't found in clips"
      );
    }

    return this.clips[clip_id];
  }

  play(clip_id) {
    let clip = this.get_clip(clip_id);
    if (!clip) {
      console.log("failed to play audio clip: " + clip_id);
      return;
    }
    clip.play();
  }

  pause(clip_id) {
    let clip = this.get_clip(clip_id);
    if (!clip) {
      console.log("failed to pause audio clip: " + clip_id);
      return;
    }
    clip.pause();
  }

  stop(clip_id) {
    let clip = this.get_clip(clip_id);
    if (!clip) {
      console.log("failed to stop audio clip: " + clip_id);
      return;
    }
    clip.stop();
  }

  volume(clip_id, level) {
    let clip = this.get_clip(clip_id);
    clip.volume(level);
  }

  set_time(clip_id, time) {
    let clip = this.get_clip(clip_id);
    clip.set_time(time);
  }

  mute(clip_id) {
    let clip = this.get_clip(clip_id);
    clip.mute();
  }

  unmute(clip_id) {
    let clip = this.get_clip(clip_id);
    clip.unmute();
  }

  loop(clip_id, looping_bool) {
    let clip = this.get_clip(clip_id);
    clip.loop(looping_bool);
  }

  playing(clip_id) {
    let clip = this.get_clip(clip_id);
    return clip.playing();
  }

  paused(clip_id) {
    let clip = this.get_clip(clip_id);
    return clip.paused();
  }

  get_volume(clip_id) {
    let clip = this.get_clip(clip_id);
    return clip.get_volume();
  }

  get_time(clip_id) {
    let clip = this.get_clip(clip_id);
    return clip.get_time();
  }

  muted(clip_id) {
    let clip = this.get_clip(clip_id);
    return clip.muted();
  }

  looping(clip_id) {
    let clip = this.get_clip(clip_id);
    return clip.looping();
  }

  duration(clip_id) {
    let clip = this.get_clip(clip_id);
    return clip.duration();
  }

  pause_all() {
    let i = null;
    for (i in this.clips) {
      if (this.clips[i].playing()) {
        this.clips[i].pause();
        this.currently_paused.push(this.clips[i].id);
      }
    }
  }

  unpause_all() {
    let i = null;
    for (i in this.currently_paused) {
      this.get_clip(this.currently_paused[i]).play();
    }
    this.currently_paused = [];
  }

  stop_all() {
    let i = null;
    for (i in this.clips) {
      this.clips[i].stop();
    }
  }

  volume_all(level) {
    let i = null;
    for (i in this.clips) {
      this.clips[i].volume(level);
    }
  }

  mute_all(level) {
    let i = null;
    for (i in this.clips) {
      this.clips[i].mute();
    }
    this.all_muted = true;
  }

  unmute_all(level) {
    let i = null;
    for (i in this.clips) {
      this.clips[i].unmute();
    }
    this.all_muted = false;
  }

  are_all_muted() {
    return this.all_muted;
  }

  load_clips(loaded_clips) {
    let clip = null,
      clip_id = null,
      i = null;

    if (this.clips === null) {
      this.clips = {};
    }

    for (i in loaded_clips) {
      clip_id = loaded_clips[i].id;

      console.log("loading clip " + clip_id);

      clip = new Clip(clip_id, loaded_clips[i].url, loaded_clips[i].element);

      if (this.clips && this.clips[clip_id]) {
        console.log("attempted to load multiple identical clip ids");
        debugger;
      }

      this.clips[clip_id] = clip;
    }
  }
}

class Clip {
  constructor(id, url, element) {
    this.id = id;
    this.url = url;
    this.element = element;
  }

  play() {
    this.element.play();
  }

  pause() {
    this.element.pause();
  }

  stop() {
    this.element.pause();
    this.element.currentTime = 0;
  }

  volume(level) {
    this.element.volume = level;
  }

  set_time(time) {
    this.element.currentTime = time;
  }

  mute() {
    this.element.muted = true;
  }

  unmute() {
    this.element.muted = false;
  }

  loop(looping_bool) {
    this.element.loop = looping_bool;
  }

  playing() {
    return !this.element.paused;
  }

  paused() {
    return this.element.paused;
  }

  get_volume() {
    return this.element.volume;
  }

  get_time() {
    return this.element.currentTime;
  }

  muted() {
    return this.element.muted;
  }

  looping() {
    return this.element.looping;
  }

  duration() {
    return this.element.duration;
  }
}

export default Audio;
