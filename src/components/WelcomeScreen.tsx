import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Activity, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl"
      >
        {/* Hero Icon */}
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-32 h-32 mx-auto gradient-neural rounded-3xl flex items-center justify-center neural-glow"
          >
            <Brain className="h-16 w-16 text-white" />
          </motion.div>
          
          {/* Floating Elements */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-4 -left-8 w-12 h-12 bg-synapse-primary/20 rounded-full flex items-center justify-center"
          >
            <Zap className="h-6 w-6 text-synapse-primary" />
          </motion.div>
          
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-4 -right-8 w-12 h-12 bg-electric-primary/20 rounded-full flex items-center justify-center"
          >
            <Activity className="h-6 w-6 text-electric-primary" />
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-6xl font-bold mb-6"
        >
          <span className="text-neural text-neural-primary">Zero Vector 7</span>
          <br />
          <span className="gradient-neural bg-clip-text text-transparent">Ollama</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-cognitive-text/80 mb-8 leading-relaxed"
        >
          Wave Interference based Cognitive AI architecture featuring <strong className="text-synapse-primary">Holographic Memory</strong> processing 
          and <strong className="text-electric-primary">Neural Wave</strong> interference for superior reasoning and contextual understanding.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="p-6 bg-card/60 backdrop-blur-sm rounded-2xl border border-synapse-primary/20">
            <div className="w-12 h-12 bg-synapse-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="h-6 w-6 text-synapse-primary" />
            </div>
            <h3 className="font-bold text-synapse-primary mb-2">Inner Thoughts</h3>
            <p className="text-sm text-cognitive-text/70">
              Analyzes intent, context, and planning before processing your requests
            </p>
          </div>

          <div className="p-6 bg-card/60 backdrop-blur-sm rounded-2xl border border-electric-primary/20">
            <div className="w-12 h-12 bg-electric-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Brain className="h-6 w-6 text-electric-primary" />
            </div>
            <h3 className="font-bold text-electric-primary mb-2">Frontal Lobe</h3>
            <p className="text-sm text-cognitive-text/70">
              Advanced reasoning and response generation with step-by-step thinking
            </p>
          </div>

          <div className="p-6 bg-card/60 backdrop-blur-sm rounded-2xl border border-neural-primary/20">
            <div className="w-12 h-12 bg-neural-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Activity className="h-6 w-6 text-neural-primary" />
            </div>
            <h3 className="font-bold text-neural-primary mb-2">Real-time Insights</h3>
            <p className="text-sm text-cognitive-text/70">
              Visualize the cognitive processing in real-time with detailed traces
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="h-14 px-8 text-lg gradient-neural hover:scale-105 transition-transform duration-300"
          >
            Configure API & Start
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-cognitive-text/60 mt-4">
            You'll need an OpenRouter API key to get started
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
