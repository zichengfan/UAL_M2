# UAL M2 - Collaborative Memory Mapping System

A distributed memory collection platform for lab members to contribute and preserve shared memories. Built for seamless collaboration through Git-based workflows and interactive mapping.

## 🎯 Project Principles

**UAL M2** is a collaborative memory preservation system where:
- **Lab members** contribute memories for **graduating colleagues**
- **Distributed data collection** through individual contributions
- **Git-based collaboration** for data aggregation
- **Interactive mapping** with location-based memories
- **Persistent attribution** with color-coded contributions


## 🚀 Quick Start Guide

### For Individual Contributors

1. **Setup**
   ```bash
   # Fork the repo on GitHub first, then clone your own fork to local
   git clone https://github.com/<your-username>/UAL_M2.git
   cd UAL_M2
   chmod +x run.sh
   ./run.sh
   ```

2. **Contribute**
   - Open http://localhost:8000/enhanced-index.html
   - Register your profile
   - Add memories for graduating members
   - Save and commit your data

3. **Share**
   ```bash
   # Create a branch for your contribution and leave the main branch empty
   git checkout -b contributions/yourname
   git add data/
   git commit -m "Add memories by [name]"
   git push origin contributions/yourname
   # Create Pull Request
   ```

### For Repository Maintainers

1. **Merge Contributions**
   ```bash
   # Review and merge each PR
   git checkout main
   git merge contributions/member1
   git merge contributions/member2
   # Resolve conflicts in data/ directory
   git commit -m "Aggregate all member contributions"
   ```

2. **Distribute Final Dataset**
   ```bash
   git push origin main
   # Notify all members to pull final data
   ```

## 🔧 Dependencies

- **Python 3.6+** (for local server)
- **Modern Web Browser** (Chrome/Firefox/Safari)
- **Git** (for collaboration workflow)
- **Mapbox Account** (free tier sufficient)

## 📁 Repository Structure

```
UAL_M2/
├── enhanced-index.html      # Main application
├── run.sh                   # Quick start script
├── js/
│   ├── enhanced-memory-map.js
│   └── data-manager.js
├── css/enhanced-styles.css
├── scripts/user-data-server.py
└── data/                    # Collaboration target directory
    ├── users/               # Member profiles
    ├── memories/            # Memory contributions
    └── uploads/             # Attached files
```


## 📄 License

Internal project for Urban Analytics Lab (UAL) - NUS Architecture.
For collaboration questions, contact the UAL team.

---

*Building collective memories through collaborative technology* 🎓
