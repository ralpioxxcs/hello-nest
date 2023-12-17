import { join } from 'path/posix';

// 서버 프로젝트의 루트 디렉터리
export const PROJECT_ROOT_PATH = process.cwd();

// 외부 접근 가능한 파일들을 모아둔 디렉터리
export const PUBLIC_FOLDER_NAME = 'public';

// 포스트 디렉터리
export const POSTS_FOLDER_NAME = 'posts';

// 임시 디렉터리
export const TEMP_FOLDER_NAME = 'temp';

// 실제 공개 디렉터리의 절대경로
// /{project root}/public
export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME);

// 포스트 이미지 저장 디렉터리
// /{project root}/public/posts
export const POST_IMAGE_PATH = join(PUBLIC_FOLDER_PATH, POSTS_FOLDER_NAME);

// /public/posts/xxx.jpg (절대 경로 아님)
export const POST_PUBLIC_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  POSTS_FOLDER_NAME,
);

// 임시 파일들을 저장할 디렉터리
// /{project root}/temp
export const TEMP_FOLDER_PATH = join(PUBLIC_FOLDER_PATH, TEMP_FOLDER_NAME);
