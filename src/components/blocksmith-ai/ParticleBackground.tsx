
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
            const isDark = true; // All themes are dark now

            let baseOptions: ISourceOptions = {
                background: {
                    color: {
                        value: "transparent",
                    },
                },
                fpsLimit: 120,
                detectRetina: true,
            };

            switch (theme) {
                case 'theme-matrix':
                    return {
                        ...baseOptions,
                        particles: {
                            color: { value: "#00ff00" },
                            move: {
                                direction: "bottom",
                                enable: true,
                                outModes: { default: "out" },
                                random: false,
                                speed: 3,
                                straight: true,
                            },
                            number: { density: { enable: true, area: 800 }, value: 150 },
                            opacity: { value: { min: 0.3, max: 0.8 } },
                            shape: { type: "circle" },
                            size: { value: { min: 1, max: 3 } },
                        },
                    };
                
                case 'theme-synthwave':
                    return {
                        ...baseOptions,
                        particles: {
                            color: { value: ["#ff00ff", "#00ffff"] },
                            links: {
                                color: "#ffffff",
                                distance: 150,
                                enable: true,
                                opacity: 0.2,
                                width: 1,
                            },
                            move: {
                                direction: "none",
                                enable: true,
                                outModes: { default: "bounce" },
                                random: false,
                                speed: 1,
                                straight: false,
                            },
                            number: { density: { enable: true, area: 800 }, value: 80 },
                            opacity: { value: 0.5 },
                            shape: { type: "circle" },
                            size: { value: { min: 1, max: 3 } },
                        },
                         interactivity: {
                            events: { onHover: { enable: true, mode: "repulse" } },
                            modes: { repulse: { distance: 100, duration: 0.4 } },
                        },
                    };

                case 'theme-quantum':
                     return {
                        ...baseOptions,
                        particles: {
                            color: { value: "#33bbff" },
                            links: { color: "#33bbff", distance: 120, enable: true, opacity: 0.3, width: 1 },
                            move: { enable: true, speed: 0.5, direction: "none", random: true, straight: false, outModes: { default: "out" } },
                            number: { density: { enable: true, area: 800 }, value: 120 },
                            opacity: { value: { min: 0.1, max: 0.6 } },
                            shape: { type: "circle" },
                            size: { value: { min: 1, max: 2 } },
                        },
                         interactivity: {
                            events: { onHover: { enable: true, mode: "bubble" }, resize: true },
                            modes: { bubble: { distance: 150, duration: 2, opacity: 1, size: 5 } },
                        },
                    };
                
                default: // Default Dark theme
                    return {
                        ...baseOptions,
                        interactivity: {
                            events: {
                                onHover: { enable: true, mode: "bubble" },
                                resize: true,
                            },
                            modes: {
                                bubble: { distance: 200, duration: 2, opacity: 0.8, size: 6, color: "#55aaff" },
                            },
                        },
                        particles: {
                            color: {
                                value: "#ffffff",
                            },
                            links: { enable: false },
                            move: {
                                direction: "none",
                                enable: true,
                                outModes: { default: "out" },
                                random: true,
                                speed: 0.2,
                                straight: false,
                            },
                            number: {
                                density: { enable: true, area: 800 },
                                value: 250,
                            },
                            opacity: {
                                value: { min: 0.1, max: 0.8 },
                                animation: { enable: true, speed: 0.5, sync: false }
                            },
                            shape: { type: "circle" },
                            size: {
                                value: { min: 0.5, max: 2 },
                                animation: { enable: true, speed: 2, sync: false }
                            },
                        },
                    };
            }
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
