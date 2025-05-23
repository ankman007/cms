"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PostPage from "../../../components/PostPage";
import { formatDate } from "../../../../../utils";
import { PostDetailProps } from "../../../../../constant/types";
import { fetchWithAuth } from "../../../../../utils";
import withAuth from "@/app/hoc/withAuth";
import ArticlePageSkeleton from "@/app/skeletons/ArticlePageSkeleton";

const PostDetailPage = () => {
  const { urlSlug, articleId } = useParams();
  const [articleData, setArticleData] = useState<PostDetailProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleData = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");

        if (urlSlug && typeof urlSlug === "string") {
          setLoading(true);

          try {
            const articlesResponse = await fetchWithAuth(
              `http://localhost:8000/articles/${articleId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!articlesResponse.ok) {
              const errorData = await articlesResponse.json();
              throw new Error(
                errorData.message ||
                  `HTTP error! status: ${articlesResponse.status}`
              );
            }

            const articlesData = await articlesResponse.json();
            
            const formattedArticle = {
              articleId: articlesData.id,
              authorId: articlesData.author_id,
              authorName: articlesData.author_name,
              title: articlesData.title,
              updatedAt: formatDate(articlesData.updated_at),
              description: articlesData.seo_description,
              likes: articlesData.like_count,
              comments: articlesData.comments_count,
              isBookmarked: false,
              content: articlesData.content,
              seoSlug: articlesData.slug,
              readTime: "3 min", 
              thumbnailImage: articlesData.thumbnail || "/thumbnail.jpg",
              authorImage: articlesData.author_avatar || "/dummy-profile.jpg",
            };

            setArticleData(formattedArticle);
          } catch {
            console.error("Error fetching article:");
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    };

    fetchArticleData();
  }, [urlSlug, articleId]);

  if (loading) {
    return <ArticlePageSkeleton />;
  }

  if (!articleData && !loading) {
    return <div>Article data not found.</div>;
  }

  return articleData ? <PostPage {...articleData} /> : <div>Article data not found.</div>;
};

export default withAuth(PostDetailPage);
