
'use client';
import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";

const ParticleBackground = () => {
    const [init, setInit] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = async (container?: Container): Promise<void> => {};

    const options: ISourceOptions = useMemo(
        () => {
            // "Gilded Sentinel" is the 'dark' theme, "Monochrome Matrix" is the 'light' theme
            const isGildedSentinel = theme === 'dark';
            
            const particleColor = isGildedSentinel
                ? ["#ffc300", "#ffebb3", "#4da6ff"] // Gold, Pale Gold, Cool Blue for Gilded Sentinel
                : ["#42f38c", "#a3b1cc", "#fafdff"]; // Bright Green, Cool Gray, White for Monochrome Matrix
                
            const linkColor = isGildedSentinel ? "#7a8194" : "#a1a3ac";

            return {
                background: {
                    color: {
                        value: "transparent",
                    },
                },
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: "repulse",
                        },
                        resize: true,
                    },
                    modes: {
                        repulse: {
                            distance: 100,
                            duration: 0.4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: particleColor,
                    },
                    links: {
                        color: linkColor,
                        distance: 120,
                        enable: true,
                        opacity: 0.1,
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "out",
                        },
                        random: true,
                        speed: 1.2,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 150,
                    },
                    opacity: {
                        value: { min: 0.1, max: 0.7 },
                        animation: {
                            enable: true,
                            speed: 0.5,
                            sync: false,
                        }
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 2.5 },
                        animation: {
                            enable: true,
                            speed: 2,
                            sync: false,
                        }
                    },
                },
                detectRetina: true,
            };
        },
        [theme],
    );

    if (init) {
        return (
            <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
                <Particles
                    id="tsparticles"
                    particlesLoaded={particlesLoaded}
                    options={options}
                />
            </div>
        );
    }

    return null;
};

export default ParticleBackground;
