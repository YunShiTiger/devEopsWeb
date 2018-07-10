import request from '@/utils/request'
import { objectIterator } from '@/utils/iterator'
import { get } from 'https';

/*
* API_MODULE: WORK
* API_USE: FETCH,CREATE,UPDATE,DELETE
* */
export function fetch_WorkListByPage(pagination,obj){
  let st = objectIterator(obj)
    return request({
      url: '/api-work/v1/codework/bypage/'+ st +'&page='+pagination.page,
      method: 'GET'
    })
  }

  export function create_Work(data){
    return request({
      url: '/api-work/v1/codework/create/',
      method: 'POST',
      data: data
    })
  }

  export function check_Work(uuid){
    return request({
      url: '/api-work/v1/codework/'+uuid+'/check/',
      method: 'PUT',
      data: {'status':2}
    })
  }

  export function run_Work(uuid){
    return request({
      url: '/api-work/v1/codework/'+uuid+'/run/',
      method: 'PUT',
      data: {'status':4}
    })
  }

  export function upload_Work(uuid,data){
    return request({
      url: '/api-work/v1/codework/'+uuid+'/upload/',
      method: 'PUT',
      data: {"files":data}
    })
  }

  export function results_Work(obj){
    return request({
      url: '/api-work/v1/codework/'+obj.uuid+'/results/',
      method: 'GET'
    })
  }