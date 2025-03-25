"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, MessageSquare, Flag, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import { Comment } from "@/app/_lib/types"
import { commentSchema, Commentschema } from "@/app/_lib/schemas/project"
import { createComment } from "@/app/_actions/projects"
import { toast } from "@/hooks/use-toast"
import { TOAST_ERROR_TITLE } from "@/app/_lib/constants"
import { formatRelativeTime } from "@/app/_lib/utils"


export function ProjectComments({ projectId, fetchedComments }: { projectId: string, fetchedComments: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(fetchedComments)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{
    commentId: number | null,
    parentPath: string | null
  }>({ commentId: null, parentPath: null })

  const [threadView, setThreadView] = useState<{
    parentId: number | null,
    comments: Comment[],
    level: number,
    parentThreads: {
      parentId: number,
      comments: Comment[]
    }[]
  } | null>(null)

  // New state for expanded threads
  const [expandedThreads, setExpandedThreads] = useState<{[key: number]: boolean}>({})

  const MAX_COMMENT_DEPTH = 4 // Nesting level before converting to thread view
  const MAX_INITIAL_REPLIES = 2 // Number of initial visible replies

  const form = useForm<Commentschema>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  })

  const replyForm = useForm<Commentschema>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  })

  const onSubmit = async (values: Commentschema) => {
    setSubmitting(true)

    const result = await createComment(projectId, values.content, null)

    if(result.status) {
      const newComment = result["comment"]

      // Add the new comment to the list
      setComments([
        {
          ...newComment,
          created_at: formatRelativeTime(newComment.created_at),
          username: newComment.username,
          replies: []
        },
        ...comments
      ])

      form.reset()
    } else {
      toast({
        title: TOAST_ERROR_TITLE,
        description: result.error,
        variant: "destructive"
      })
    } 
    setSubmitting(false)
  }

  const onSubmitReply = async (values: Commentschema) => {
    setSubmitting(true)

    try {
      if (replyingTo.commentId === null) return

      // Construct the path for the new reply
      const parentID = replyingTo.commentId

      const result = await createComment(projectId, values.content, parentID)
      if(!result.status){
        toast({
          title: TOAST_ERROR_TITLE,
          description: result.error,
          variant:"destructive"
        })
        return
      }


      const newReply = result["comment"]

      // Deep clone the comments to modify nested structure
      const updatedComments = comments.map(comment => {
        // If this is the parent comment
        if (comment.id === replyingTo.commentId) {
          return {
            ...comment,
            replies: [
              ...(comment.replies || []),
              {
                ...newReply,
                created_at: formatRelativeTime(newReply.created_at),
                username: newReply.username,
                replies: []
              }
            ]
          }
        }
        // If it's a nested comment, we need to go deeper
        return handleNestedReply(comment, replyingTo.commentId as number, newReply)
      })

      setComments(updatedComments)
      
      // If in thread view, also update the thread view state
      if (threadView && threadView.parentId) {
        const updatedThreadComments = threadView.comments.map(comment => {
          if (comment.id === replyingTo.commentId) {
            return {
              ...comment,
              replies: [
                ...(comment.replies || []),
                {
                  ...newReply,
                  created_at: formatRelativeTime(newReply.created_at),
                  username: newReply.username,
                  replies: []
                }
              ]
            }
          }
          return handleNestedReply(comment, replyingTo.commentId as number, newReply)
        })
        
        setThreadView({
          ...threadView,
          comments: updatedThreadComments
        })
      }
      
      replyForm.reset()
      setReplyingTo({ commentId: null, parentPath: null })
    } catch (error:any) {
      toast({
        title: TOAST_ERROR_TITLE,
        description: error.message,
        variant:"destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Recursive function to handle nested replies
  const handleNestedReply = (
    comment: Comment, 
    parentId: number, 
    newReply: any
  ): Comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [
          ...(comment.replies || []),
          {
            ...newReply,
            created_at: formatRelativeTime(newReply.created_at),
            username: newReply.username,
            replies: []
          }
        ]
      }
    }

    // If the comment has replies, check them recursively
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: comment.replies.map(reply => 
          handleNestedReply(reply, parentId, newReply)
        )
      }
    }

    return comment
  }

  const openThread = (parentComment: Comment) => {
    // If already in thread view, store current thread info in parent threads
    if (threadView) {
      setThreadView({
        parentId: parentComment.id,
        comments: [parentComment],
        level: threadView.level + 1,
        parentThreads: [
          ...threadView.parentThreads,
          {
            parentId: threadView.parentId as number,
            comments: threadView.comments
          }
        ]
      })
    } else {
      // Opening first thread from main view
      setThreadView({
        parentId: parentComment.id,
        comments: [parentComment],
        level: 1,
        parentThreads: []
      })
    }
    setReplyingTo({ commentId: null, parentPath: null })
  }

  // Modified to navigate to previous thread level
  const closeThread = () => {
    if (!threadView) return
    
    // If we're at level 1, go back to main comments
    if (threadView.level === 1) {
      setThreadView(null)
    } else {
      // Get the last parent thread from the array
      const lastParentThread = threadView.parentThreads[threadView.parentThreads.length - 1]
      
      // Go back to previous thread level
      setThreadView({
        parentId: lastParentThread.parentId,
        comments: lastParentThread.comments,
        level: threadView.level - 1,
        parentThreads: threadView.parentThreads.slice(0, -1) // Remove the last parent thread
      })
    }
    
    setReplyingTo({ commentId: null, parentPath: null })
  }

  // Recursive rendering of comments with potentially unlimited nesting
  const renderComments = (comments: Comment[], depth: number = 0, inThreadView: boolean = false) => {
    return comments.map((comment) => {
      // Determine if comment needs thread view
      const isDeepNested = depth >= MAX_COMMENT_DEPTH

      // If comment is deeply nested and not already in a thread view, show continue thread button
      if (isDeepNested && !inThreadView) {
        return (
          <div key={comment.id} className="ml-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#3B82F6] hover:text-[#1E3A8A] flex items-center gap-1"
              onClick={() => openThread(comment)}
            >
              <ChevronDown className="mr-1 h-4 w-4" />
              Continue this thread
            </Button>
          </div>
        )
      }
      
      // If already in thread view and reaches max depth again, show another thread button
      if (isDeepNested && inThreadView) {
        return (
          <div key={comment.id} className="ml-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#3B82F6] hover:text-[#1E3A8A] flex items-center gap-1"
              onClick={() => openThread(comment)}
            >
              <ChevronDown className="mr-1 h-4 w-4" />
              Continue this thread
            </Button>
          </div>
        )
      }

      return (
        <div 
          key={comment.id} 
          className="space-y-3" 
          style={{ 
            marginLeft: depth > 0 ? `${1 * depth}rem` : 0,
            paddingLeft: depth > 0 ? '0.5rem' : 0
          }}
        >
          <Card className={`text-sm ${depth > 0 ? 'border-l-2 border-gray-200' : ''}`}>
            {/* Existing comment card content - keep your original implementation */}
            <CardHeader className="p-[10px]">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.image_url || "/placeholder.svg"} alt={comment.username} />
                  <AvatarFallback className="bg-[#1E3A8A] text-white">
                    {comment.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{comment.username}</div>
                  <div className="text-xs text-gray-500">{comment.created_at}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-[10px]">
              <p className="whitespace-pre-line">{comment.content}</p>
            </CardContent>
            <CardFooter className="p-[10px] pt-0 flex justify-between">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-[#3B82F6]"
                onClick={() => setReplyingTo({ 
                  commentId: comment.id, 
                  parentPath: depth === 0 ? null : comments.find(c => c.id === comment.id)?.path || null 
                })}
              >
                <MessageSquare className="h-4 w-4" />
                Reply
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Flag className="h-4 w-4" />
            </Button>
          </CardFooter>
          </Card>

          {replyingTo.commentId === comment.id && (
          <Card className="ml-12">
            <Form {...replyForm}>
              <form onSubmit={replyForm.handleSubmit(onSubmitReply)}>
                <CardContent className="pt-6">
                  <FormField
                    control={replyForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder={`Reply to ${comment.username}...`}
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setReplyingTo({ commentId: null, parentPath: null })}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#3B82F6] hover:bg-[#1E3A8A]" disabled={submitting}>
                    {submitting ? "Posting..." : "Post Reply"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        )}

          {/* Replies with limited initial visibility */}
          {comment.replies && comment.replies.length > 0 && (
            <div>
              {renderComments(
                comment.replies.slice(0, MAX_INITIAL_REPLIES), 
                depth + 1,
                inThreadView
              )}
              
              {comment.replies.length > MAX_INITIAL_REPLIES && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 ml-4"
                  onClick={() => setExpandedThreads(prev => ({
                    ...prev, 
                    [comment.id]: !prev[comment.id]
                  }))}
                >
                  {expandedThreads[comment.id] 
                    ? "Hide replies" 
                    : `Show ${comment.replies.length - MAX_INITIAL_REPLIES} more replies`
                  }
                  {expandedThreads[comment.id] 
                    ? <ChevronUp className="ml-2 h-4 w-4" /> 
                    : <ChevronDown className="ml-2 h-4 w-4" />
                  }
                </Button>
              )}

              {/* Expanded replies if thread is open */}
              {expandedThreads[comment.id] && (
                renderComments(
                  comment.replies.slice(MAX_INITIAL_REPLIES), 
                  depth + 1,
                  inThreadView
                )
              )}
            </div>
          )}
        </div>
      )
    })
  }

  // Thread view rendering
  if (threadView) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" className="mr-2 hover:text-accentColor" onClick={closeThread}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {threadView.level === 1 ? "Back to all comments" : `Back to Thread #${threadView.level - 1}`}
          </Button>
          <h2 className="text-xl font-bold text-secondaryColor">Thread #{threadView.level}</h2>
        </div>

        <div className="space-y-4">
          {renderComments(threadView.comments, 0, true)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Comments</h2>

      {/* Comment form */}
      <Card className="mb-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="p-[10px]">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts on this project..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="p-[10px] flex justify-end">
              <Button type="submit" className="bg-[#3B82F6] hover:bg-[#1E3A8A]" disabled={submitting}>
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {comments.length === 0 ? (
        <Card>
          <CardContent className="p-3 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Be the first to comment on this project!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {renderComments(comments)}
        </div>
      )}
    </div>
  )
}