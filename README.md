[<img src="https://raw.githubusercontent.com/CrystalSystems/crystal-v2.0/refs/heads/main/assets/crystal-v2.0_logo.png">](https://shedov.top/description-and-capabilities-of-crystal-v2-0/)


[![Members](https://img.shields.io/badge/dynamic/json?style=for-the-badge&label=&logo=discord&logoColor=white&labelColor=black&color=%23f3f3f3&query=$.approximate_member_count&url=https%3A%2F%2Fdiscord.com%2Fapi%2Finvites%2FENB7RbxVZE%3Fwith_counts%3Dtrue)](https://discord.gg/ENB7RbxVZE)&nbsp;[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge&logo=5865F2&logoColor=black&labelColor=black&color=%23f3f3f3)](https://github.com/CrystalSystems/crystal-v2.0/blob/main/LICENSE)<br/>
[![About_project](https://img.shields.io/badge/About_project-black?style=for-the-badge)](https://shedov.top/about-the-crystal-project)&nbsp;[![Documentation](https://img.shields.io/badge/Documentation-black?style=for-the-badge)](https://shedov.top/documentation-crystal/)&nbsp;[![Developer’s Diary](https://img.shields.io/badge/Developer’s_Diary-black?style=for-the-badge)](https://shedov.top/category/crystal/crystal-developers-diary/)

**Architecture:** <br/>
SPA, REST API, FSD.

**Composition:** <br/>
[Full code](https://github.com/CrystalSystems/crystal-v2.0/) | Package.json: [frontend](https://github.com/CrystalSystems/crystal-v2.0/blob/main/frontend/package.json) | [backend](https://github.com/CrystalSystems/crystal-v2.0/blob/main/backend/package.json)<br/>

**Structure:** <br/>
MongoDB v8.0.4.<br/>
Express.js v4.21.2.<br/>
React v19.0.0.<br/>
Node.js v24.0.2.<br/>
NPM v11.3.0.<br/>
PM2 v5.4.3.<br/>
Vite v6.1.0.<br/>

A more convenient [description](https://shedov.top/description-and-capabilities-of-crystal-v2-0/) of this version is on the website [shedov.top](https://shedov.top/).<br/>
Functionally, this version is almost completely identical to [CRYSTAL v1.0](https://shedov.top/description-and-capabilities-of-crystal-v1-0/), but has a number of key improvements:

1. Mongoose has been removed and replaced by [native driver](https://www.npmjs.com/package/mongodb) MongoDB.

2. Data schemas for all collections (<code>[users](https://github.com/CrystalSystems/crystal-v2.0/blob/main/backend/src/modules/user/user.schema.js)</code>, <code>[posts](https://github.com/CrystalSystems/crystal-v2.0/blob/main/backend/src/modules/post/post.schema.js)</code>, <code>[likes](https://github.com/CrystalSystems/crystal-v2.0/blob/main/backend/src/modules/like/like.schema.js)</code>, <code>[hashtags](https://github.com/CrystalSystems/crystal-v2.0/blob/main/backend/src/modules/hashtag/hashtag.schema.js)</code>), defined using the standard JSON Schema and [initialized](https://github.com/CrystalSystems/crystal-v2.0/blob/main/backend/src/core/engine/db/initializeCollections.js) in MongoDB using the <code>[$jsonSchema](https://www.mongodb.com/docs/manual/reference/operator/query/jsonSchema/#mongodb-query-op.-jsonSchema)</code>. This approach provides consistency and a common structure for documents in collections.

3. For <code>[hashtags](https://github.com/CrystalSystems/crystal-v2.0/blob/main/backend/src/modules/hashtag/hashtag.schema.js)</code> and <code>[likes](https://github.com/CrystalSystems/crystal-v2.0/blob/main/backend/src/modules/like/like.schema.js)</code> separate collections were created with denormalization and indexing, which will provide higher performance with a large amount of data.

4. UX/UI design has been improved for larger tablet screens (iPad Pro and similar devices). The side navigation bar has become more compact, increasing the display area of ​the main content:

<p align="center">
  <img src="https://raw.githubusercontent.com/CrystalSystems/crystal-v2.0/refs/heads/main/assets/screenshot_1.webp"  alt="CRYSTAL v1.0 features"/>
</p>
<p align="center">|Screenshot 1| Improved UX/UI design, light theme.</p>
<br>
<p align="center">
  <img src="https://raw.githubusercontent.com/CrystalSystems/crystal-v2.0/refs/heads/main/assets/screenshot_2.webp"  alt="CRYSTAL v1.0 features"/>
</p>
<p align="center">|Screenshot 2| Improved UX/UI design, dark theme.</p>


5. To search through post content (this component will be published in the [repository](https://github.com/CrystalSystems/crystal-v2.0) later), MongoDB full-text search is used based on the <code>[$text](https://www.mongodb.com/docs/manual/reference/operator/query/text/)</code> operator.

6. Added user status (online/offline). The logic is implemented using WebSocket ([frontend](https://github.com/CrystalSystems/crystal-v2.0/blob/main/frontend/src/shared/hooks/useWebSocket/useWebSocket.js) | [backend]([</a>](https://github.com/CrystalSystems/crystal-v2.0/blob/main/backend/src/core/engine/web/websocket.js))). Added display of the time of the last visit to the site.

7. The user status (when offline) now displays the time of their last visit to the site.

8. [Multer](https://www.npmjs.com/package/multer) has been replaced by [Sharp](https://www.npmjs.com/package/sharp). The following image upload management and cybersecurity features have been added to [sharp-upload.js](https://github.com/CrystalSystems/crystal-v2.0/blob/main/backend/src/shared/):

**— Limiting simultaneous image processing ([Semaphore](https://github.com/CrystalSystems/crystal-v2.0/blob/ca54aec0bc7a5ef96b9172d005aca608829bd05e/backend/src/shared/utils/sharp/sharp-upload.js#L38))**<br>
To prevent processor overload during resource-intensive image processing, a semaphore mechanism is used.

**— Request rate limiting ([Rate Limiting](https://github.com/CrystalSystems/crystal-v2.0/blob/ca54aec0bc7a5ef96b9172d005aca608829bd05e/backend/src/shared/utils/sharp/sharp-upload.js#L83))**<br>
To protect against DDoS attacks and spam, a limit on the number of download requests from a single IP address is used.

**— Limiting the size of the uploaded file**<br>
Checking [limit](https://github.com/CrystalSystems/crystal-v2.0/blob/ca54aec0bc7a5ef96b9172d005aca608829bd05e/backend/src/shared/utils/sharp/sharp-upload.js#L123) occurs early in the upload process to avoid reading excessively large files into memory.

**— Uploaded file validation process**<br>
After passing the initial checks (Semaphore and Rate Limiting), the uploaded file undergoes a double check (<code class="inline-code"><a href="https://github.com/CrystalSystems/crystal-v2.0/blob/ca54aec0bc7a5ef96b9172d005aca608829bd05e/backend/src/shared/utils/sharp/sharp-upload.js#L193" rel="noopener" target="_blank">!isImageExtension</a></code> and <code class="inline-code"><a href="https://github.com/CrystalSystems/crystal-v2.0/blob/ca54aec0bc7a5ef96b9172d005aca608829bd05e/backend/src/shared/utils/sharp/sharp-upload.js#L194" rel="noopener" target="_blank">!isImageMime</a></code>) to ensure that it is indeed a safe image. The system simultaneously checks two independent characteristics of the file: the extension (checking the file name for one of the allowed extensions: <code class="inline-code">jpe?g|png|webp|gif</code>) and the MIME type, which must match: <code class="inline-code">image\/(jpeg|png|webp|gif)</code>. If any of these checks fail, the file goes to <a href="https://github.com/CrystalSystems/crystal-v2.0/blob/ca54aec0bc7a5ef96b9172d005aca608829bd05e/backend/src/shared/utils/sharp/sharp-upload.js#L198" rel="noopener" target="_blank">a special GIF check</a>, and the subsequent <code class="inline-code"><a href="https://github.com/CrystalSystems/crystal-v2.0/blob/ca54aec0bc7a5ef96b9172d005aca608829bd05e/backend/src/shared/utils/sharp/sharp-upload.js#L8" rel="noopener" target="_blank">isValidGif(fileBuffer)</a></code>, which checks for "Magic Bytes" in the file header (<code class="inline-code">GIF87a</code> or <code class="inline-code">GIF89a</code>).

9. GIFs are sanitized via <a href="https://github.com/CrystalSystems/crystal-v2.0/blob/6c3478f5ea8bb037b4de42b0feff5f6560c753c4/backend/src/shared/utils/sharp/sharp-upload.js#L228" rel="noopener" target="_blank">special logic</a>. All images except GIFs are <a href="https://github.com/CrystalSystems/crystal-v2.0/blob/6c3478f5ea8bb037b4de42b0feff5f6560c753c4/backend/src/shared/utils/sharp/sharp-upload.js#L251" rel="noopener" target="_blank">converted</a> to WebP.

10. Added an interface setting that allows you to hide all GIF images on the site:
<p align="center">
  <img src="https://raw.githubusercontent.com/CrystalSystems/crystal-v2.0/refs/heads/main/assets/screenshot_3.webp"  alt="CRYSTAL v1.0 features"/>
</p>
<p align="center">|Screenshot 3| Hidden GIF images, light theme.</p>
<br>
<p align="center">
  <img src="https://raw.githubusercontent.com/CrystalSystems/crystal-v2.0/refs/heads/main/assets/screenshot_4.webp"  alt="CRYSTAL v1.0 features"/>
</p>
<p align="center">|Screenshot 4| Hidden GIF images, dark theme.</p>

11. Added the ability to specify user gender.
12. On the user page, a section with detailed user information has been added: gender, registration date.
13. Added a privacy setting that allows you to hide gender.
14. To improve performance, offset pagination has been replaced with cursor-based pagination in the user likes and posts with a specific hashtag display sections.
15. Added a 'Back' button.
16. Added logic for deleting old images from posts and users: after deleting/replacing images, after deleting a user or post.

17. Added <a href="https://github.com/CrystalSystems/crystal-v2.0/blob/main/backend/src/shared/helpers/extract-hashtags-from-text/extract-hashtags-from-text.js" target="_blank" rel="noopener" >validation</a> for hashtags in the backend, which prevents saving hashtags like: <code class="inline-code">##Test</code>, <code class="inline-code">#Te#st</code>, <code class="inline-code">#Te?st</code>, etc. The check is performed using a regular expression — <code class="inline-code">/^[\p{L}0-9_-]+$/u</code> (allows any Unicode letters, numbers, hyphens, and underscores). You can also set the allowed number of hashtags in one post and the hashtag length using constants: <code class="inline-code">MAX_HASHTAGS_COUNT</code> and <code class="inline-code">MAX_HASHTAG_LENGTH</code>. After successful verification, the hashtag <code class="inline-code">#Test</code> is added to the <code class="inline-code">name</code> field of the <code class="inline-code">hashtags</code> collection, in lowercase — <code class="inline-code">test</code>. If a hashtag fails validation, it is not added to the database, but the post is still created and its text will contain an invalid hashtag — <code class="inline-code">#Te#st</code>.

18. Added <a href="https://github.com/CrystalSystems/crystal-v2.0/blob/main/frontend/src/shared/helpers/formatting/formatLinksInText.jsx" target="_blank" rel="noopener" >validation</a> for hashtags in the frontend. To be displayed as a clickable link, the hashtag must be validated using a regular expression — <code class="inline-code">/^[\p{L}0-9_-]+$/u</code> (Allows any Unicode letters, numbers, hyphens, and underscores).

19. Database cybersecurity system complies with <a href="https://shedov.top/description-and-capabilities-of-crystal-v1-0/#paragraph_7" rel="noopener" target="_blank">CRYSTAL v1.0  (Production)</a>.

**⚠️ Before using [CRYSTAL v2.0](https://github.com/CrystalSystems/crystal-v2.0) or its code in a production environment, it is strongly recommended to carefully review the implementation and assess any potential cybersecurity risks.**<br/>

<h3 align="center">CRYSTAL is tested on</h3>
<p align="center">
  <a href="https://www.browserstack.com/">
    <img src="https://raw.githubusercontent.com/CrystalSystems/crystal-v2.0/bc7bf8b166feef1f4aed3e88dac61d1a25dd2665/assets/browserstack_logo.svg" width="290" />
  </a>
</p>

[![SHEDOV.TOP](https://img.shields.io/badge/SHEDOV.TOP-black?style=for-the-badge)](https://shedov.top/) 
[![CRYSTAL](https://img.shields.io/badge/CRYSTAL-black?style=for-the-badge)](https://crysty.ru/AndrewShedov)
[![Discord](https://img.shields.io/badge/Discord-black?style=for-the-badge&logo=discord&color=black&logoColor=white)](https://discord.gg/ENB7RbxVZE)
[![Telegram](https://img.shields.io/badge/Telegram-black?style=for-the-badge&logo=telegram&color=black&logoColor=white)](https://t.me/ShedovTop)
[![X](https://img.shields.io/badge/%20-black?style=for-the-badge&logo=x&logoColor=white)](https://x.com/AndrewShedov)
[![VK](https://img.shields.io/badge/VK-black?style=for-the-badge&logo=vk)](https://vk.com/ShedovTop)
[![VK Video](https://img.shields.io/badge/VK%20Video-black?style=for-the-badge&logo=vk)](https://vkvideo.ru/@ShedovTop)
[![YouTube](https://img.shields.io/badge/YouTube-black?style=for-the-badge&logo=youtube)](https://www.youtube.com/@AndrewShedov)
 
