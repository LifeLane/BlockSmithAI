
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
            const particleColor = theme === 'dark'
                ? ["#FFD580", "#F9FAFC"] // Pale Gold & White for Gilded Sentinel
                : ["#29a35d", "#57e68c"]; // Green shades for Monochrome Matrix

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
                            mode: "bubble",
                        },
                        resize: true,
                    },
                    modes: {
                        bubble: {
                            distance: 200,
                            duration: 2,
                            opacity: 0.8,
                            size: 6,
                        },
                    },
                },
                particles: {
                    color: {
                        value: particleColor,
                    },
                    links: {
                        enable: false, // Disabled for a starfield look
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "out",
                        },
                        random: true,
                        speed: 0.6, // Increased speed
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 400, // Increased particle count
                    },
                    opacity: {
                        value: { min: 0.1, max: 0.8 }, // Twinkling effect
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
                        value: { min: 0.5, max: 2 }, // Twinkling effect
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
