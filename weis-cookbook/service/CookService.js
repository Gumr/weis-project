import HandleResponse from './basic'
import {get, post} from '../utils/http'

export default class CookService extends HandleResponse {
  /**
   * 获取集活动列表 当前最新的排在最前
   */
  queryActivityList(params = {}) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/queryActivityList',
      data: {
        method: 'queryActivityList',
        params: [params]
      }
    })
  }

  /**
   * 根据征集期获取榜单列表
   * * @param {String} taPhase 活动期
   */
  queryRankingListByTrPhase(params = {}) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/queryRankingListByTrPhase',
      data: {
        method: 'queryRankingListByTrPhase',
        params: [params]
      }
    })
  }

  /**
   * 查看首页食谱列表
   * @param {String} userType 01：普通用户；02名厨 默认01
   * @param {Number} pageNo
   * @param {Number} pageSize
   */
  queryHomeRecipesList(params = {}) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/queryHomeRecipesList',
      data: {
        method: 'queryHomeRecipesList',
        params: [params]
      }
    })
  }

  /**
   * 上传和修改食谱
   * @param {String} TrId 食谱id(传为修改，不传为新增)
   * @param {String} trType 食谱类型 （01：素菜；02：荤菜
   * ...
   */
  uploadCook(params) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/addRecipes',
      data: {
        method: 'addRecipes',
        params: [params]
      }
    })
  }

  /**
   * 搜索食谱
   * @param {String} keyWord 关键词 
   */
  searchCook(params) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/searchRecipesList',
      data: {
        method: 'searchRecipesList',
        params: [params]
      },
      loadingMsg: '请稍候...'
    })
  }

  /**
   * 查看我的食谱列表
   * @param {String} pageNo 
   * @param {String} pageSize 
   * @param {} TrAuditResult 03：投票中/通过审核 注：不传默认查食谱列表 
   * @param {} uid 查看用户食谱列表（不传查看自己）
   * @result {} TrAuditResult 审核结果(00：违规被禁；01：待审核；02：审核中；03：未通过审核；04：通过审核；05：投票中；06：终止投票；07：研发中；08：已上架；09：已下架)
   */
  getMyCook(params) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/getRecipesList',
      data: {
        method: 'getRecipesList',
        params: [params]
      }
    })
  }

  /**
   * 查看我的收藏
   * @param {String} pageNo 
   * @param {String} pageSize 
   */
  getMyCollect(params) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/queryMyCollectList',
      data: {
        method: 'queryMyCollectList',
        params: [params]
      }
    })
  }

  /**
   * 查看我的投票
   * @param {String} pageNo 
   * @param {String} pageSize 
   */
  getMyVote(params) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/queryMyVoteList',
      data: {
        method: 'queryMyVoteList',
        params: [params]
      }
    })
  }

  /**
   * 根据id查询食谱详情
   * @param {String} trId 
   */
  queryRecipesById(params) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/queryRecipesById',
      data: {
        method: 'queryRecipesById',
        params: [params]
      },
      loadingMsg: '请稍候...'
    })
  }

   /**
   * 根据id查询食谱详情
   * @param {String} trId 
   */
  deleteRecipesById(params) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/deleteRecipesById',
      data: {
        method: 'deleteRecipesById',
        params: [params]
      },
      loadingMsg: '请稍候...'
    })
  }

   /**
   * 投票菜谱/取消投票
   * @param {String} trId:菜谱标识(Long) 
   * @param {String} trState:状态1投票0取消投票(int)
   */
  voteRecipes(params) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/voteRecipes',
      data: {
        method: 'voteRecipes',
        params: [params]
      },
      loadingMsg: '请稍候...'
    })
  }

  /**
   * 收藏菜谱/取消收藏
   * @param {String} trId:菜谱标识(Long) 
   * @param {String} trState:状态1收藏0取消收藏(int)
   */
  collectRecipes(params) {
    return post({
      url: '/cn.weis.api.recipes.Recipes/collectRecipes',
      data: {
        method: 'collectRecipes',
        params: [params]
      },
      loadingMsg: '请稍候...'
    })
  }
}