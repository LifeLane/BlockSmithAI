
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
            let baseOptions: ISourceOptions = {
                background: {
                    color: { value: "transparent" },
                },
                fpsLimit: 120,
                detectRetina: true,
            };

            switch (theme) {
                case 'theme-green':
                    return {
                        ...baseOptions,
                        particles: {
                            color: { value: "#33ff33" },
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
                            shape: { type: "char", character: { value: ['B','S','A','I','$','0','1'], style: "font-family: 'Space Mono', monospace;" }},
                            size: { value: { min: 4, max: 8 } },
                        },
                    };
                
                case 'theme-red':
                    return {
                        ...baseOptions,
                         interactivity: { events: { onHover: { enable: true, mode: "repulse" } } },
                        particles: {
                            color: { value: ["#ff3333", "#ff9933"] },
                            links: { color: "#ff6666", distance: 150, enable: true, opacity: 0.3, width: 1 },
                            move: { enable: true, speed: 1.5, direction: "none", random: true, straight: false, outModes: { default: "out" } },
                            number: { density: { enable: true, area: 800 }, value: 80 },
                            opacity: { value: { min: 0.2, max: 0.7 } },
                            shape: { type: "circle" },
                            size: { value: { min: 1, max: 4 } },
                        },
                    };

                case 'theme-yellow':
                     return {
                        ...baseOptions,
                        particles: {
                            color: { value: ["#ffd700", "#ffa500", "#ffffff"] },
                            move: {
                                direction: "top",
                                enable: true,
                                outModes: { default: "out" },
                                random: true,
                                speed: 0.8,
                                straight: false,
                            },
                            number: { density: { enable: true, area: 800 }, value: 200 },
                            opacity: { value: { min: 0.3, max: 0.9 }, animation: { enable: true, speed: 1, sync: false }},
                            shape: { type: "circle" },
                            size: { value: { min: 1, max: 3 } },
                        },
                    };

                case 'theme-purple':
                    return {
                        ...baseOptions,
                        interactivity: { events: { onHover: { enable: true, mode: "grab" } } },
                        particles: {
                            color: { value: ["#9400d3", "#ff00ff", "#33ccff"] },
                            links: { color: "#dda0dd", distance: 150, enable: true, opacity: 0.4, width: 1 },
                            move: { enable: true, speed: 1, direction: "none", random: false, straight: false, outModes: { default: "bounce" } },
                            number: { density: { enable: true, area: 800 }, value: 100 },
                            opacity: { value: 0.6 },
                            shape: { type: "circle" },
                            size: { value: { min: 1, max: 5 } },
                        },
                    };
                
                case 'theme-white':
                    return {
                        ...baseOptions,
                        interactivity: {
                            events: { onHover: { enable: true, mode: "bubble" } },
                            modes: { bubble: { distance: 200, duration: 2, opacity: 1, size: 5, color: "#cccccc" }},
                        },
                        particles: {
                            color: { value: "#aaaaaa" },
                            move: { enable: true, speed: 0.5, direction: "top", random: true, straight: false, outModes: { default: "out" } },
                            number: { density: { enable: true, area: 1200 }, value: 150 },
                            opacity: { value: { min: 0.1, max: 0.4 } },
                            shape: { type: "circle" },
                            size: { value: { min: 1, max: 3 } },
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
