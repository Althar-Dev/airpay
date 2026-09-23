'use client';
import * as Tone from 'tone';

let synth: Tone.Synth | null = null;

// Function to play a notification sound
export async function playNotificationSound() {
  try {
    // Ensure Tone.js is started on a user gesture
    if (Tone.context.state !== 'running') {
      await Tone.start();
      console.log("AudioContext started successfully.");
    }

    // Create a synth if it doesn't exist
    if (!synth) {
      synth = new Tone.Synth().toDestination();
    }

    // Play a note. A slightly pleasant sound.
    const now = Tone.now();
    synth.triggerAttackRelease("G5", "8n", now);
    synth.triggerAttackRelease("C6", "8n", now + 0.1);
  } catch (error) {
    console.error("Error playing sound:", error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
}
