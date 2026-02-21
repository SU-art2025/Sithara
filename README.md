
 <p align="center">
   [<img src="./img.png" alt="Project Banner" width="100%">](https://su-art2025.github.io/Sithara/)
 </p>
 
 # Sithare (Smarty) 🎯
 
 ## Basic Details
 
 ### Team Name: [HUGS FOR BUGS]
 
 ### Team Members
 - Member 1: [SREDHA MANOJ] - [COLLEGE OF ENGINEERING,KALLOOPARA]
 - Member 2: [UTHRAJA J] - [COLLEGE OF ENGINEERING,KALLOOPARA]
 
 ### Hosted Project Link
     https://su-art2025.github.io/Sithara/
 
 ### Project Description
 Sithare (Smarty) is a child-friendly web app that helps children track mood, complete routines, and earn fun-time rewards.  
 It also gives parents a secure dashboard to manage routines, approved videos, and monitor emotional/activity insights.
 
 ### The Problem Statement
 Parents need a simple way to guide children’s routines, understand emotional state, and safely control digital content from one place.
 
 ### The Solution
 We built a dual-interface app: Child Mode for mood check-ins, tasks, and rewards, and Parent Settings for PIN-protected controls, insights, planner tools, and voice replies.
 
 ---
 
 ## Technical Details
 
 ### Technologies/Components Used
 
 #### For Software
 - Languages used: HTML, CSS, JavaScript
 - Frameworks used: None (Vanilla JS)
 - Libraries used: Browser APIs (MediaRecorder, Speech Synthesis, LocalStorage)
 - Tools used: VS Code, Git, GitHub, Browser DevTools
 
 ### Features
 
 List the key features of your project:
 - Feature 1: Child mood tracker with expressive emoji interface and voice note support
 - Feature 2: Routine checklist with daily reset and reward-driven Fun Time videos
 - Feature 3: Parent PIN login, content filtering, and routine planner (single   bulk task add)
 - Feature 4: Parent insights dashboard with logs, sentiment summary, and parent-to-child voice replies
 
 ---
 
 ## Implementation
 
 ### For Software
 
 #### Installation
 ```bash
 git clone <your-repo-link>
 cd <project-folder>
 ```
 
 #### Run
 ```bash
 # Option 1: Open directly
 start html/Smarty.html
 
 # Option 2: Use VS Code Live Server
 ```
 
 ## Project Documentation
 
 ### For Software
 
 #### Screenshots (Add at least 3)
 
 ![Screenshot1](<img width="1851" height="813" alt="image" src="https://github.com/user-attachments/assets/17101fcc-a9c6-4813-846c-a2891dbb2def" />
)  
 Child dashboard showing mood panel, checklist, and reward-based Fun Time section.
 
 ![Screenshot2]<img width="1912" height="680" alt="image" src="https://github.com/user-attachments/assets/68853e1e-fbba-437c-a2e9-0083f03224af" />

  
 Parent insights view showing activity logs and sentiment analysis summary.
 
 ![Screenshot3](<img width="1894" height="875" alt="image" src="https://github.com/user-attachments/assets/7b9d490e-7ee6-411c-900e-2dc867f67ee0" />
<img width="1913" height="869" alt="image" src="https://github.com/user-attachments/assets/03201940-9924-431c-ae2b-a58eca2ec33b" />


 
 Parent planner and content filter with routine/task and approved video management.
 
 #### Diagrams
 
 **System Architecture:**
 
 ![Architecture Diagram](docs/architecture.png)  
 Frontend-only architecture: child view and parent view share a browser state layer with LocalStorage persistence and browser media APIs.
 
 **Application Workflow:**
 
 ![Workflow](docs/workflow.png)  
 Child actions (emotion, task completion, voice) generate logs and rewards; parent reviews insights, updates routines/videos, and sends voice replies to child.
 
 ---
 
 ## Additional Documentation
 
 ### For Web Projects with Backend
 Not applicable in current version (no backend; data persists locally in browser LocalStorage).
 
 #### API Documentation
 Not applicable in current version.
