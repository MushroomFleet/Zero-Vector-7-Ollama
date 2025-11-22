# Neural Cognito Core - Advanced Cognitive AI Architecture

![Neural Cognito Core](https://img.shields.io/badge/Neural%20Cognito-Core-blue?style=for-the-badge&logo=brain&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Privacy%20First-green?style=for-the-badge&logo=llama&logoColor=white)

*A sophisticated multi-lobe cognitive AI system with holographic memory reconstruction, real-time thinking visualization, and complete privacy through local AI processing*

## 🧠 Overview

Neural Cognito Core is an advanced cognitive AI architecture that simulates human-like thinking processes through specialized "lobes" that work together to analyze, process, and respond to user input. The system features revolutionary holographic memory reconstruction, real-time cognitive visualization, and comprehensive multi-modal capabilities.

**🎉 MAJOR MILESTONE ACHIEVED**: Full Ollama integration is now complete and stable, providing complete privacy and offline AI processing capabilities!

### Key Features

- **🏠 Local AI Processing**: Complete privacy with Ollama integration - no data leaves your machine
- **☁️ Cloud AI Access**: Full OpenRouter integration with 200+ premium AI models
- **🔄 Dual Provider System**: Seamlessly switch between local privacy and cloud power
- **🔮 Holographic Memory System**: Advanced wave-based memory reconstruction with interference patterns and emergent behavior detection
- **🧠 Multi-Lobe Architecture**: Specialized cognitive regions (Inner Thoughts, Frontal Lobe, Temporal Lobe, Occipital Lobe)
- **🎯 Custom System Prompts**: Hybrid approach allowing custom analysis while maintaining system stability
- **👁️ Vision Analysis**: Advanced image processing and description capabilities
- **🗣️ Text-to-Speech**: Natural speech synthesis with ElevenLabs integration
- **🔍 Web Search Integration**: Real-time information retrieval via Perplexity AI
- **📊 Real-time Visualization**: Live cognitive process monitoring and holographic system state
- **📁 Complete Export System**: Chat logs, cognitive traces, and audio files
- **🌓 Dark/Light Theme**: Beautiful adaptive UI with neural-inspired design
- **⚡ Smart Performance**: Automatic retry logic, model preloading, and timeout optimization

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager (recommended) - `npm install -g yarn`

**Choose Your AI Provider:**
- **Option A**: OpenRouter API key (for cloud AI models) - [Get key](https://openrouter.ai)
- **Option B**: Ollama installed locally (for privacy-first AI) - [Download Ollama](https://ollama.ai)

**Optional Services:**
- ElevenLabs API key (for text-to-speech)
- Perplexity API key (for web search)

> **Privacy Note**: With Ollama, all AI processing happens locally on your machine. No data is sent to external servers.
> **Performance Note**: Yarn is strongly recommended over npm for this project due to better handling of optional dependencies (particularly Rollup's native binaries on Windows).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MushroomFleet/neural-cognito-core.git
   cd neural-cognito-core
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏠 Local AI Setup (Privacy Mode)

For complete privacy and offline operation, you can run Neural Cognito Core entirely on your local machine using Ollama. **This integration is now fully implemented and optimized for production use!**

### Ollama Installation

1. **Download and Install Ollama**
   ```bash
   # Visit https://ollama.ai and download for your platform
   # Or use package managers:
   
   # Windows (via Chocolatey)
   choco install ollama
   
   # macOS (via Homebrew)
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Start Ollama Service**
   ```bash
   ollama serve
   ```

3. **Download AI Models**
   ```bash
   # Core models (optimized for the cognitive architecture):
   ollama pull qwen3:4b                           # Default general model
   ollama pull qwen3:4b-thinking-2507-q4_K_M     # Frontal lobe reasoning
   ollama pull qwen3:4b-instruct-2507-q4_K_M     # Temporal lobe processing
   ollama pull blaifa/InternVL3_5:4b             # Occipital lobe vision analysis
   
   # Additional recommended models:
   ollama pull qwen2.5:7b                         # Enhanced general conversation
   ollama pull deepseek-coder:6.7b               # Code assistance
   ollama pull gemma2:9b                          # Complex reasoning tasks
   ```

4. **Verify Installation**
   ```bash
   ollama list  # Shows installed models
   ```

### Privacy Benefits
- **🔒 Complete Privacy**: All processing happens locally
- **🌐 Offline Operation**: No internet required after setup
- **💰 Zero Cost**: No API usage fees
- **🏎️ Fast Response**: Direct hardware access with model preloading
- **🛡️ Data Security**: Your conversations never leave your device
- **⚡ Smart Performance**: Automatic model preloading and keep-alive functionality
- **🔧 Intelligent Recovery**: Advanced retry logic with exponential backoff
- **🎯 Optimized Models**: Lobe-specific model selection for best performance

### Troubleshooting

#### Installation Issues on Windows

If you encounter errors related to `@rollup/rollup-win32-x64-msvc` or similar Rollup native dependencies, this is a known npm issue with optional dependencies on Windows. Here are the solutions:

**Option 1: Use Yarn (Recommended)**
```bash
# Remove existing npm installation
rm -rf node_modules package-lock.json
npm install -g yarn
yarn install
yarn dev
```

**Option 2: Clean npm installation**
```bash
# Clean existing installation
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run dev
```

**Option 3: Manual dependency fix**
```bash
npm install @rollup/rollup-win32-x64-msvc --save-optional
npm run dev
```

> **Why this happens**: npm has a bug with optional dependencies that can cause Rollup's platform-specific binaries to not install correctly. Yarn handles these dependencies more reliably.

#### Ollama Connection Issues

**Ollama Server Not Found:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# If not running, start the service
ollama serve

# Check for port conflicts (default is 11434)
netstat -an | findstr :11434  # Windows
lsof -i :11434                # macOS/Linux
```

**Model Loading Issues:**
```bash
# Verify models are installed
ollama list

# Check model availability
ollama show qwen3:4b

# Force re-pull if corrupted
ollama rm qwen3:4b
ollama pull qwen3:4b
```

**Performance Issues:**
```bash
# Increase Ollama memory allocation (if needed)
# Set environment variable before starting
export OLLAMA_MAX_LOADED_MODELS=4
export OLLAMA_NUM_PARALLEL=2
ollama serve
```

**Windows-Specific Issues:**
- Ensure Windows Defender isn't blocking Ollama
- Run PowerShell as Administrator for first-time setup
- Check Windows Firewall settings for port 11434

**Provider Switching Issues:**
- Clear browser cache after switching providers
- Restart the development server after Ollama configuration changes
- Check browser console for detailed error messages

### Configuration

1. **Provider Setup**
   - Click the "Settings" button in the top-right corner
   - **For Privacy Mode**: Ensure Ollama is running locally (automatic detection)
   - **For Cloud Mode**: Enter your OpenRouter API key
   - Switch between providers seamlessly with the provider toggle
   - System automatically selects optimal models per cognitive lobe

2. **Advanced Configuration**
   - **Ollama Settings**: Configure base URL and timeout (default: http://localhost:11434)
   - **Model Selection**: Choose specific models for each cognitive lobe
   - **Performance Tuning**: Adjust temperature and token limits per lobe
   - **Feature Toggles**: Enable/disable holographic memory, TTS, web search

3. **Cognitive Lobe Configuration**
   - **Frontal Lobe**: Default to reasoning-optimized models (qwen3:4b-thinking)
   - **Temporal Lobe**: Uses instruction-following models (qwen3:4b-instruct) 
   - **Occipital Lobe**: Dedicated vision models (blaifa/InternVL3_5:4b)
   - **Inner Thoughts**: General conversation models for analysis

## 🧬 Architecture

### Cognitive Lobes

####  Inner Thoughts (Analysis)
- **Purpose**: Analyzes user intent, context, and planning
- **Features**: Web search integration, custom prompt support, holographic enhancement
- **Default Model**: `qwen3:4b` (Ollama) / `anthropic/claude-3.5-sonnet` (OpenRouter)
- **Output**: Intent classification, confidence scoring, processing steps

#### 🧠 Frontal Lobe (Response Generation)
- **Purpose**: Primary response generation and reasoning
- **Features**: Context-aware processing, holographic enhancement, retry logic
- **Default Model**: `qwen3:4b-thinking-2507-q4_K_M` (Ollama) / `anthropic/claude-3.5-sonnet` (OpenRouter)
- **Output**: Structured responses with reasoning traces

#### 👁️ Occipital Lobe (Vision)
- **Purpose**: Image analysis and visual understanding
- **Features**: Object detection, color analysis, text extraction, multi-modal processing
- **Default Model**: `blaifa/InternVL3_5:4b` (Ollama) / `anthropic/claude-3.5-sonnet` (OpenRouter)
- **Output**: Detailed visual descriptions and guidance

#### 🗣️ Temporal Lobe (Speech)
- **Purpose**: Audio synthesis and speech processing
- **Features**: ElevenLabs integration, voice customization, audio caching
- **Default Model**: `qwen3:4b-instruct-2507-q4_K_M` (Ollama) / `anthropic/claude-3.5-sonnet` (OpenRouter)
- **Output**: Natural speech audio files with local storage

### � Holographic Memory System

The revolutionary holographic memory system uses wave interference patterns to:

- **Store and retrieve** conversation context across sessions
- **Detect emergent patterns** in user behavior and preferences
- **Enhance responses** through memory reconstruction
- **Provide graceful degradation** when primary systems fail
- **Generate insights** from wave interference patterns

#### Wave Types
- **CONTEXT**: Conversation and situational awareness
- **INTENT**: User goals and objectives
- **CONFIDENCE**: System certainty levels
- **TEMPORAL**: Time-based and sequential information
- **MEMORY**: Long-term knowledge storage
- **PERSONA**: User personality and preferences
- **REASONING**: Logical processes and deduction
- **VISUAL**: Image and spatial information

## 💡 Usage

### Basic Chat
1. Enter your message in the chat interface
2. Watch real-time cognitive processing in the visualizer
3. Receive contextual, intelligent responses
4. Optional: Generate speech synthesis for responses

### Image Analysis
1. Upload an image using the attachment button
2. Add optional text description
3. View detailed visual analysis
4. Get contextual responses based on image content

### Custom System Prompts
1. Click the "System" button in the header
2. Upload a custom analysis prompt file
3. The system automatically appends core requirements
4. Toggle between custom and default prompts

### Export Data
1. Click "Export" to download complete session data
2. Includes chat logs, cognitive traces, and audio files
3. Perfect for analysis, research, or backup purposes

## 🛠️ Advanced Configuration

### Model Selection
- **Primary Models**: Claude 3.5 Sonnet, GPT-4, Gemini Pro
- **Lobe-Specific**: Configure different models per cognitive lobe
- **Temperature Control**: Fine-tune creativity vs. consistency
- **Token Limits**: Optimize for speed vs. detail

### Holographic System
- **Wave Frequencies**: Customize cognitive wave patterns
- **Interference Thresholds**: Adjust memory reconstruction sensitivity
- **Fragment Management**: Control memory storage and retrieval
- **Emergent Detection**: Configure pattern recognition parameters

### Speech Synthesis
- **Voice Selection**: Choose from multiple ElevenLabs voices
- **Quality Settings**: Balance between speed and audio quality
- **Auto-Speech**: Enable automatic speech generation
- **Speech Summaries**: Generate conversational audio summaries

## 📊 Monitoring & Analytics

### Cognitive Visualization
- **Real-time Processing**: Watch thoughts form in real-time
- **System Metrics**: Monitor performance and confidence
- **Memory State**: View active holographic patterns
- **Coherence Levels**: Track system integration quality

### Export Analytics
- **Processing Times**: Analyze response generation speeds
- **Confidence Tracking**: Monitor system certainty over time
- **Memory Usage**: Track holographic system utilization
- **Error Patterns**: Identify and address system issues

## 🔧 Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite with Rollup optimization
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: Zustand with persistence
- **AI Providers**: Ollama (local), OpenRouter (cloud)
- **Animations**: Framer Motion, React Spring
- **Visualization**: D3.js, Konva, Recharts
- **Package Management**: Yarn (recommended for Windows compatibility)

### Project Structure
```
src/
├── cognitive/           # Core AI processing logic
│   ├── lobes/          # Individual cognitive components
│   │   ├── InnerThoughts.ts    # Analysis and web search
│   │   ├── FrontalLobe.ts      # Primary reasoning
│   │   ├── TemporalLobe.ts     # Speech synthesis
│   │   └── OccipitalLobe.ts    # Vision analysis
│   └── CognitiveEngine.ts      # Main orchestrator
├── holographic/        # Memory reconstruction system
├── services/           # AI provider integrations
│   └── providers/      # Ollama, OpenRouter providers
├── components/         # React UI components
├── stores/            # Zustand state management
└── types/             # TypeScript definitions
```

### Available Scripts
```bash
yarn dev           # Start development server
yarn build         # Build for production
yarn preview       # Preview production build
yarn lint          # Run ESLint
```

## 🌟 Key Benefits

- **🎯 Accurate Analysis**: Multi-stage processing ensures comprehensive understanding
- **🔮 Memory Enhancement**: Holographic system provides context across conversations
- **⚡ Fast Response**: Optimized architecture for real-time interaction
- **🛡️ Robust Fallbacks**: Graceful degradation ensures system reliability
- **📈 Transparent Process**: Complete visibility into AI reasoning
- **🎨 Beautiful Interface**: Intuitive design with cognitive visualizations
- **🔧 Highly Configurable**: Extensive customization options
- **📊 Complete Tracking**: Comprehensive logging and export capabilities

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and standards
- Testing requirements
- Pull request process
- Issue reporting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Complete API documentation available
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join our community discussions
- **Updates**: Follow releases for new features

---

**Built with ❤️ for the future of human-AI interaction**

*Neural Cognito Core - Where artificial intelligence meets cognitive architecture*

## 🚀 Recent Achievements

- ✅ **Ollama Integration Complete**: Full local AI processing with privacy guarantees
- ✅ **Dual Provider Architecture**: Seamless switching between local and cloud AI
- ✅ **Performance Optimization**: Model preloading, keep-alive, and smart retry logic  
- ✅ **Lobe-Specific Models**: Optimized model selection for each cognitive function
- ✅ **Advanced Error Handling**: Graceful degradation and holographic fallbacks
- ✅ **Windows Compatibility**: Resolved dependency issues with proper package management

## 🔍 Technical Implementation Details

### Ollama Provider Features
- **Connection Management**: Automatic server detection and health monitoring
- **Model Management**: Dynamic model loading with intelligent caching
- **Error Recovery**: Exponential backoff retry logic for failed requests
- **Performance Optimization**: Model preloading and keep-alive functionality
- **Context Handling**: Efficient token management and context window optimization
- **Provider Switching**: Hot-swapping between local and cloud providers without restart

### System Requirements
- **Minimum RAM**: 8GB (16GB recommended for larger models)
- **Storage**: 5GB+ for core models (varies by model size)
- **CPU**: Modern multi-core processor (GPU acceleration supported where available)
- **Network**: Internet required only for initial model downloads and cloud provider usage

## 📚 Citation

### Academic Citation

If you use this codebase in your research or project, please cite:

```bibtex
@software{zero-vector_7_ollama,
  title = {Zero Vector 7 Ollama: sophisticated multi-lobe cognitive AI system with holographic memory reconstruction, real-time thinking visualization, and complete privacy through local AI processing},
  author = {[Drift Johnson]},
  year = {2025},
  url = {https://github.com/MushroomFleet/Zero-Vector-7-Ollama},
  version = {1.0.0}
}
```

### Donate:


[![Ko-Fi](https://cdn.ko-fi.com/cdn/kofi3.png?v=3)](https://ko-fi.com/driftjohnson)
