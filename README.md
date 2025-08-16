# albion_discord_bot
 A Discord bot that allows you to have a dedicated Discord channel for in-game objectives. It includes the objective type, rarity, map, and time remaining before activation.

# 🆕 New Version

---

## ⚙️ New Commands

### 🔹 `/register <nickname>`
Links your Discord account with your in-game account (nickname).  
Members with the role **"Recruitment Pending"** will see a `#register` channel where they can use this command.  
If the person is indeed part of the guild, they will automatically receive the role **"Recruits"** and lose the role **"Recruitment Pending"**.

---

### 🔹 `/review <@user>`
Allows members with the **Reviewer** role to add a review to the mentioned user's profile.

---

### 🔹 `/profil <@user>`
Displays the number of attendances and reviews.  
(Currently, only attendances with more than 25 players, since **July 30th**, are counted.)

---

### 🔹 `/resetregister <@user>`
Command reserved for **Officers**.  
Removes a Discord / in-game link in case of an error during a new recruit's `/register`.

---

## ⚠️ Notes
- The `/register` and `/resetregister` commands are only available in the `#register` channel.  
- Parameters for attendance calculation (dates and minimum number of players) can be updated later as needed.
