import { useEffect } from "react";
import SpectrumBackground from "./components/SpectrumBackground";
import ControlDeck from "./components/ControlDeck";
import InstrumentHeader from "./components/InstrumentHeader";
import Readout from "./components/Readout";
import Ribbon from "./components/Ribbon";
import StartOverlay from "./components/StartOverlay";
import { useInstrumentController } from "./useInstrumentController";
import { synth } from "./synth";
import "./emotion-spectrum.css";

/**
 * EMOTION//SPECTRUM - embedded build of the Electromagnetic Spectrum Emotion
 * Web Instrument (zazieproductions/Electromagnetic-Spectrum-Emotion-Web-Instrument).
 *
 * The standalone app is a full-viewport single page; inside the ZIAA archive it
 * runs as a bounded laboratory panel: its atmosphere, start overlay and control
 * deck are contained in this relative wrapper so the archive shell (header,
 * footer, navigation) stays reachable around it.
 */
export default function EmotionSpectrumInstrument() {
  const controller = useInstrumentController();

  // Silence every voice when the visitor leaves the laboratory, so latched
  // drones and the theremin never follow them through the archive.
  useEffect(() => {
    return () => {
      synth.allOff();
    };
  }, []);

  return (
    <div className="emotion-spectrum relative w-full overflow-hidden rounded-xl border border-[#3d3358] flex flex-col text-[#eae6ff] shadow-2xl shadow-black/60">
      <SpectrumBackground />
      <div className="relative flex flex-col">
        <InstrumentHeader
          accent={controller.accent}
          mode={controller.mode}
          selectMode={controller.selectMode}
        />

        <Readout
          currentCell={controller.currentCell}
          accent={controller.accent}
          intensity={controller.intensity}
        />

        <Ribbon
          mode={controller.mode}
          drone={controller.drone}
          latched={controller.latched}
          activeKeys={controller.activeKeys}
          keyForCell={controller.keyForCell}
          ribbonRef={controller.ribbonRef}
          onPointerDown={controller.onRibbonPointerDown}
          onPointerMove={controller.onRibbonPointerMove}
          onPointerEnd={controller.endPointer}
        />

        <ControlDeck
          settings={controller.settings}
          updateSetting={controller.updateSetting}
          mode={controller.mode}
          drone={controller.drone}
          toggleDrone={controller.toggleDrone}
          arp={controller.arp}
          toggleArp={controller.toggleArp}
          arpRate={controller.arpRate}
          setArpRate={controller.setArpRate}
          accent={controller.accent}
          panic={controller.panic}
        />
      </div>

      {!controller.started && <StartOverlay onStart={controller.start} />}
    </div>
  );
}
