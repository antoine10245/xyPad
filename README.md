In the little prompt asking what we could bring to learning Music/Synth, I suggested the idea of writing a little chapter on the history of sampling. So I connected this idea with the challenge.

I suggested giving the user the ability to play with their own samples.

That being said, I implemented here three features:
 
 - Gain visualization on the xyPad: I used Tone.js Meter to create a Gain visualizer around the XY pad. 

 - Step sequencer: the sequencer is taking care of replaying the user interaction precisely. It is simulating mouse events, so the user can see exactly what they played. it is using a web worker to generate a consistent and steady loop event.

 - Mic recorder: the mic recorder is allowing the user to record and play with their own samples.
 

## What else has been done 
 - Converted actual web audio nodes to Tone.js nodes in order to use a meter node.
 - Fixed a bug due to an un-triggered mouseUp event when the user is moving the cursor out of the xyPad area. We are now listening for window mouseUp events and forcing the playback to stop.
 - refactor xyPad events callback.
 - Implementing an EventBus to do bidirectional event dispatch across different files, also improves code readability.
 - installed Tailwind and daisyUI via CDN to improve overall UI.