
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
            const isDark = theme === 'dark';
            
            const particleColors = isDark 
                ? ["#60a5fa", "#a78bfa", "#fb923c", "#f8fafc"]
                : ["#2563eb", "#7c3aed", "#f97316", "#0f172a"];

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
                            distance: 80,
                            duration: 0.4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: particleColors,
                    },
                    links: {
                        color: "random",
                        distance: 120,
                        enable: true,
                        opacity: 0.15,
                        width: 1,
                        triangles: {
                            enable: true,
                            color: {
                                value: isDark ? "#111827" : "#f3f4f6"
                            },
                            opacity: 0.03
                        }
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "out",
                        },
                        random: true,
                        speed: 1.5,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 200,
                    },
                    opacity: {
                        value: { min: 0.1, max: 0.5 },
                        animation: {
                            enable: true,
                            speed: 0.8,
                            sync: false,
                        }
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 2 },
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
