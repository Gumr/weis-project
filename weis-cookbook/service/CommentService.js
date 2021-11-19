import HandleResponse from './basic'
import {get, post} from '../utils/http'

export default class CookService extends HandleResponse {
  /**
   * 查询食谱的评论
   * @param {String} trdId 食谱id
   */
  queryCommentList(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Comment/queryCommentList',
      data: {
        method: 'queryCommentList',
        params: [params]
      }
    })
  }

  /**
   * 查询食谱主评论
   * @param {String} trdId 食谱id
   * @param {String} pageNo 主评论页数
   * @param {String} pageSize 主评论条数
   */
  queryCommentList(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Comment/queryCommentList',
      data: {
        method: 'queryCommentList',
        params: [params]
      }
    })
  }

  /**
   * 查询食谱的子评论
   * @param {String} id 主评论主键id
   * @param {String} pageNo 子评论页数
   * @param {String} pageSize 子评论条数
   */
  queryCommentReplyList(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Comment/queryCommentReplyList',
      data: {
        method: 'queryCommentReplyList',
        params: [params]
      }
    })
  }

  /**
   * 回复评论
   * @param {String} tcId 关联评论表主键id
   * @param {String} replyUid 被回复用户id
   * @param {String} content 回复内容
   * @param {String} replyType 01主评论 02回复子评论
   */
  addCommentReply(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Comment/addCommentReply',
      data: {
        method: 'addCommentReply',
        params: [params]
      }
    })
  }

  /**
   * 回复评论
   * @param {String} trdId 食谱id
   * @param {String} comment 评论内容
   */
  addComment(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Comment/addComment',
      data: {
        method: 'addComment',
        params: [params]
      }
    })
  }

  /**
   * 删除评论
   * @param {String} id 评论id
   * @param {String} commentType 评论类型(01：主评论；02：子评论)
   */
  deleteCommentById(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Comment/deleteCommentById',
      data: {
        method: 'deleteCommentById',
        params: [params]
      }
    })
  }

  /**
   * 评论点赞
   * @param {String} tcId 评论主键id
   * @param {String} commentType 评论类型（01：主评论；02：子评论）
   * @return {Number} result 0失败，大于0成功
   */
  addCommentLike(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Comment/addCommentLike',
      data: {
        method: 'addCommentLike',
        params: [params]
      }
    })
  }

  /**
   * 取消评论点赞
   * @param {String} id 点赞主键id
   * @return {Number} result 0失败，大于0成功
   */
  deleteCommentLike(params={}) {
    return post({
      url: '/cn.weis.api.recipes.Comment/deleteCommentLike',
      data: {
        method: 'deleteCommentLike',
        params: [params]
      }
    })
  }

}