import { useEffect, useState } from "react";

import { Button, Form, Spinner } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faMessage,
   faShare,
   faCircleExclamation,
   faClock,
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

import PageWrapper from "../../components/PageWrapper/PageWrapper.tsx";
import type { BoardResponse, Comment } from "../../models/BoardResponse.ts";

const Comment: React.FC<{ comment: Comment }> = ({ comment }) => {
   return (
      <div
         style={{
            marginTop: "6px",
            padding: "4px 6px",
            maxWidth: "420px",
            borderTop: "rgb(23, 25, 27) 2px solid"
         }}
      >
         <p>{comment.user.userName}</p>
         <p>{comment.text}</p>
         <div style={{
            display: "flex",
            justifyContent: "space-between"
         }}>
            <div>

            </div>
            <p
               style={{
                  color: "rgb(128, 128, 128)",
                  fontSize: "80%",
               }}
            >
               <FontAwesomeIcon icon={faClock} /> {new Date(comment.createdAt).toLocaleString(undefined, {
                  year: "2-digit",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
               })}
            </p>
         </div>
      </div>
   );
};


const Board: React.FC = () => {
   const [boardData, setBoardData] = useState<BoardResponse | null>(null);
   const [loading, setLoading] = useState(true);
   const [newComment, setNewComment] = useState("");
   const [activePostId, setActivePostId] = useState<string | null>(null);
   const [submitError, setSubmitError] = useState<string | null>(null);
   const [submitSuccess, setSubmitSuccess] = useState(false);

   const API_URL = import.meta.env.VITE_API_URL;

   const fetchBoard = async () => {
      try {
         const res = await axios.get(`${API_URL}/board`);
         setBoardData(res.data);
      } catch (err) {
         console.error("Failed to fetch board:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBoard();
   }, []);

   const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      try {
         const token = localStorage.getItem("token");
         await axios.post(
            `${API_URL}/board/comments`,
            {
               text: newComment,
               postId: null,
               parentId: null,
            },
            {
               headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
         );

         setNewComment("");
         setSubmitSuccess(true);
         setSubmitError(null);
         fetchBoard();
      } catch (error: any) {
         console.error("Error submitting comment:", error);
         setSubmitError("Failed to submit comment");
      }
   };

   const allowedRegex = /^[0-9A-Za-zА-ЩЬЮЯҐЄІЇа-щьюяґєії !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/u;
   const [hasInvalidCharacters, setHasInvalidCharacters] = useState(false);
   const [countWarning, setCountWarning] = useState<number | null>(null);

   const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const input = e.target.value;

      setHasInvalidCharacters(!allowedRegex.test(input));

      if (input.length >= 150) {
         setCountWarning(200 - input.length);
      } else {
         setCountWarning(null);
      }

      setNewComment(input);
   };

   const getInterpolatedColor = (count: number): string => {
      const progress = Math.min((count - 150) / 50, 1);
      const r = Math.round(128 + (220 - 128) * progress);
      const g = Math.round(128 + (53 - 128) * progress);
      const b = Math.round(128 + (69 - 128) * progress);
      return `rgb(${r}, ${g}, ${b})`;
   };

   return (
      <PageWrapper>
         <div style={{ color: "white", width: "440px" }}>
            {loading && <Spinner animation="border" />}
            {!loading && boardData && (
               <>
                  <h3>Feed</h3>
                  {boardData.posts
                     .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                     .map((post) => (
                        <div
                           key={post.id}
                           style={{
                              padding: "14px",
                              marginBottom: "14px",
                              borderRadius: "14px",
                              backgroundColor: "rgb(33, 37, 41)",
                           }}
                        >
                           <h4>{post.title}</h4>
                           <p>{post.content}</p>
                           <small>
                              {new Date(post.createdAt).toLocaleString(undefined, {
                                 year: "2-digit",
                                 month: "2-digit",
                                 day: "2-digit",
                                 hour: "2-digit",
                                 minute: "2-digit",
                                 hour12: false,
                              })}
                           </small>

                           {post.id === activePostId && (
                              <Form onSubmit={handleCommentSubmit}>
                                 <p
                                    style={{ color: "rgb(128, 128, 128)", margin: "4px 8px", fontSize: "90%" }}
                                 >
                                    <FontAwesomeIcon icon={faMessage} /> Start conversation
                                 </p>
                                 <Form.Group style={{ marginBottom: "0" }}>
                                    <Form.Control
                                       as="textarea"
                                       placeholder="Type your comment..."
                                       value={newComment}
                                       onChange={handleInputChange}
                                       required
                                       style={{ maxHeight: "200px", minHeight: "80px" }}
                                    />
                                 </Form.Group>

                                 {(hasInvalidCharacters || countWarning !== null) && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                       {hasInvalidCharacters ? (
                                          <p
                                             style={{ color: "rgb(220, 53, 69)", margin: "4px 0 0", fontSize: "90%" }}
                                          >
                                             <FontAwesomeIcon icon={faCircleExclamation} /> Message contains disallowed
                                             characters
                                          </p>
                                       ) : (
                                          <div />
                                       )}
                                       {countWarning !== null && (
                                          <p
                                             style={{
                                                color: getInterpolatedColor(200 - (countWarning ?? 0)),
                                                margin: "4px 0 0",
                                                fontSize: "90%",
                                             }}
                                          >
                                             {countWarning}
                                          </p>
                                       )}
                                    </div>
                                 )}

                                 <Button
                                    className="w-100"
                                    style={{ marginTop: "1rem" }}
                                    variant="dark"
                                    type="submit"
                                    disabled={newComment.length === 0 || hasInvalidCharacters || newComment.length > 200}
                                 >
                                    <FontAwesomeIcon icon={faShare} /> Send
                                 </Button>
                              </Form>
                           )}

                           <div style={{ marginTop: "1rem" }}>
                              {post.comments.length > 0 ? (
                                 post.comments.map((comment) => <Comment key={comment.id} comment={comment} />)
                              ) : (
                                 <p style={{ fontStyle: "italic", color: "#aaa" }}>No comments yet</p>
                              )}
                           </div>
                        </div>
                     ))}
               </>
            )}
         </div>
      </PageWrapper>
   );
};

export default Board;
