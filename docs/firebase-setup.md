# Firebase Integration Guide

Follow these steps to connect the blog to Firebase so posts, images, and comments persist across deployments.

## 1. Create Firebase project
- Visit [console.firebase.google.com](https://console.firebase.google.com) and create (or reuse) a project.
- In **Project settings → General**, add a **Web App** and copy the config values (`apiKey`, `authDomain`, etc.).





## 2. Enable products
1. **Firestore Database**  
   - Start in *Production mode*.  
   - Location can stay at the default.
2. **Authentication**  
   - Enable **Google** provider and restrict to Gmail (`*@gmail.com`) if desired.
3. **Storage** (optional but recommended for cover photos)  
   - Accept the default storage bucket.

## 3. Set Netlify environment variables
Add the following build vars (Site settings → Build & deploy → Environment):

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=########
VITE_FIREBASE_APP_ID=1:########:web:########
```

Commit a local `.env` file with the same variables (prefixed by `VITE_`) for local development if you want—remember not to push secrets if the repo is public.

## 4. Seed Firestore (one time)
Deploy once or run the app locally with Firebase configured.  
On first load, the app copies `src/data/posts.json` and `src/data/comments.json` into Firestore automatically.

If you already exported fresh JSON files from the editor, replace the files before deploying so Firestore receives the latest data.

## 5. Security rules
Example Firestore rules (update `admin@example.com` to your Gmail):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'admin@example.com';
    }

    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth != null
        && (request.auth.token.email == resource.data.email
            || request.auth.token.email == 'admin@example.com');
    }
  }
}
```

Storage rules should similarly restrict uploads to authenticated users.

## 6. Deploy
- Commit all code changes.
- Push to the repo so Netlify rebuilds with the Firebase keys.
- Test the site: creating/editing posts will now persist because they write to Firestore; cover images upload to Firebase Storage when credentials are set.

## 7. Backups (optional)
Use the “Download posts/comments JSON” buttons in the editor/comments section to export the current Firestore data whenever you want an offline backup.


