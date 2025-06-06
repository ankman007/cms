"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatDate, capitalize } from "../../../../utils";
import { PostCardProps } from "../../../../constant/types";
import PostCard from "@/app/components/PostCard";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { fetchWithAuth } from "../../../../utils";
import withAuth from "@/app/hoc/withAuth";
import PageListSkeleton from "@/app/skeletons/PostListSkeleton";
import { useRouter } from "next/navigation";

function UserPostPages() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId, username } = useParams();
  const token = useSelector((state: RootState) => state.auth.accessToken);

  const currentUserDetails = useSelector((state: RootState) => state.user);
  const isCurrentUsersPost = Number(currentUserDetails.id) == Number(userId);
  
  useEffect(() => {
    if (isCurrentUsersPost) {
      router.push(`/profile`);
    }
  }, [isCurrentUsersPost, router]);

  useEffect(() => {
    if (isCurrentUsersPost) return; 
    const fetchData = async () => {
      try {
        setLoading(true);

        const articlesResponse = await fetchWithAuth(
          `http://localhost:8000/articles/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!articlesResponse.ok) {
          throw new Error("Failed to fetch articles");
        }
        const articlesData = await articlesResponse.json();
        const formattedArticles = (articlesData || []).map(
          (article: {
            id: number;
            author_id: number;
            author_name: string;
            author_email: string;
            title: string;
            seo_description: string;
            updated_at: string;
            like_count: number;
            comments_count: number;
            seo_slug: string;
            author_avatar: string;
            thumbnail: string;
          }) => ({
            authorId: article.author_id,
            articleId: article.id,
            authorName: article.author_name,
            authorEmail: article.author_email,
            title: article.title,
            description: article.seo_description,
            updatedAt: formatDate(article.updated_at),
            likes: article.like_count,
            comments: article.comments_count,
            isBookmarked: false,
            authorImage: article.author_avatar || "/dummy-profile.jpg",
            thumbnailImage: article.thumbnail || "/thumbnail.jpg",
            seoSlug: article.seo_slug,
          })
        );

        setPosts(formattedArticles);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, userId, token, isCurrentUsersPost]);

  if (loading) {
    return <PageListSkeleton />;
  }

  if (error) {
    return <div>{error}</div>;
  }
  const decodedName = decodeURIComponent(username as string);

  return (
    <div className="bg-white text-black min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {username && typeof username === "string" ? capitalize(decodedName) : ""}
          <span className="block text-lg font-normal text-gray-500 mt-2">
            All posts from{" "}
            {username && typeof username === "string"
              ? capitalize(decodedName) 
              : ""}
            .
          </span>
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-6">
            {posts.map((post) => (
              <div key={post.articleId}>
                <PostCard {...post} />
                <hr />
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default withAuth(UserPostPages);
