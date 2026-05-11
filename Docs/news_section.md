# News Section Documentation

The News Section (Community News) is a feature on Goa.City that allows members to share updates, stories, and prayer requests with the community. It functions as a social feed where users can post content and engage with others.

## Features

- **View Feed**: A chronologically ordered list of community updates.
- **Create Post**: Members can share text-based updates, photos, videos, and external links.
- **Media Support**: 
    - **Photos & Videos**: Direct upload support for images and videos.
    - **Vertical Content**: The feed supports original aspect ratios (no cropping), making it ideal for vertical videos and reels.
    - **Links**: Dedicated card display for external links.
- **Like Posts**: Interactive heart button to express appreciation.
- **Delete Posts**: Users can delete their own posts at any time.
- **Edit Posts**: Members can edit the text of their posts, but only within **24 hours** of the original posting time.

## Frontend Architecture

The news feature is organized within the `src/features/news` directory.

### Components
- `NewsFeed.tsx`: The main container for the news section.
    - Features a dynamic creation box with media selection and link input toggles.
    - Implements hidden file inputs for image/video selection with live preview and removal.
    - Uses refined focus states (lightened borders) for a premium feel.
- `PostCard.tsx`: Individual post component.
    - Displays author details, content, and media.
    - **Video Player**: Uses native HTML5 video controls with height-flexible containers (up to 700px).
    - **Actions**: Aligned "Edit" and "Delete" buttons for authors within the valid window.
    - **Likes**: Real-time optimistic updates for engagement.

### Hooks
- `useNews.ts`: Uses `@tanstack/react-query` to manage feed data, mutations (create, update, like, delete), and cache invalidation.

### API Service (`news.api.ts`)
Contains axios-based functions with specific configurations for large media:
- `fetchNewsFeed(page)`
- `createPost(postData)`: Uses `FormData` for multipart uploads and features a **5-minute timeout** to handle large video uploads.
- `updatePost(postId, content)`
- `likePost(postId)`
- `deletePost(postId)`

## Backend Architecture

### Routes (`backend_node/src/routes/member.routes.ts`)
- `GET /member/news/feed`: Fetches the paginated news feed.
- `POST /member/news/post`: Creates a new post (supports `upload.single('media')`).
- `PUT /member/news/post/:id`: Updates an existing post (enforces 24h window).
- `POST /member/news/post/:id/like`: Toggles a like on a post.
- `DELETE /member/news/post/:id`: Deletes a post.

### Controller (`backend_node/src/controllers/member.controller.ts`)
Handles request validation and media metadata extraction:
- `createPost`: Extracts `media_type` (image/video) based on file extension and manages storage in `/uploads`.

### Service Layer (`backend_node/src/services/post.service.ts`)
- `getFeed`: Fetches posts with user details and engagement metrics.
- `updatePost`: **Critical Logic**: Compares the `created_at` timestamp with the current time. If `> 24 hours`, the update is rejected.
- `likePost`: Implements toggle logic for likes.

## Infrastructure & Configuration

### Nginx Configuration (`/etc/nginx/sites-enabled/goacity`)
To support large media uploads and avoid timeouts during transmission:
- `client_max_body_size 100M;`: Allows files up to 100MB.
- `proxy_read_timeout 300;`: 5-minute timeout for backend responses.
- `proxy_connect_timeout 300;`
- `proxy_send_timeout 300;`

## Data Model (Prisma)

### `Post`
- `id`: Primary Key.
- `user_id`: Reference to the Member.
- `content`: Text content.
- `media_url`: Path to the uploaded file.
- `media_type`: `'image'`, `'video'`, or `'none'`.
- `link_title`: Used to store external links.
- `created_at`: Timestamp.

## Evolution & History

- **v1.0**: Basic text-only feed.
- **v1.1**: Added likes and relations fix in Prisma.
- **v1.2**: Implemented Ownership-based Deletion and 24-hour Edit Window.
- **v1.3**: Added Multimedia support (Photos, Videos, Links) with vertical content optimization.
- **v1.4**: Optimized performance by reverting heavy server-side transcoding (VP9) in favor of fast, straightforward uploads and increased infrastructure timeouts.
