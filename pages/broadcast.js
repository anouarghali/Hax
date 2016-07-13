import Page from '../js/page'
import { makeJsLink } from '../js/util'

export default (new Page({
	'id': 'Broadcast',
	'view': 'list',
	'icon': state => state['media'] === 'radio' ? 'img/icons/home/radio.png' : 'img/icons/home/livetv.png',
	'parentState': state => ({ 'page': 'Channels', 'media': state['media'] }),
	'data': state => {

		let broadcastid =  +state['broadcastid']

		return xbmc.get({
			method: 'PVR.GetBroadcastDetails',
			params: {
				"broadcastid": broadcastid//,
				//"properties": ["thumbnail"]//["title", "plot", "plotoutline", "starttime", "endtime", "runtime", "progress", "progresspercentage", "genre", "episodename", "episodenum", "episodepart", "firstaired", "hastimer", "isactive", "parentalrating", "wasactive", "thumbnail", "rating"]
			}
		})
		.then(({ broadcastdetails }) => ({
			thumbnail: broadcastdetails.thumbnail === undefined ? 'img/icons/default/DefaultAddonNone.png' : xbmc.vfs2uri(broadcastdetails.thumbnail),
			pageName: [ state['media'], 'Broadcast' ].join(' '),
			title: broadcastdetails.label,
			actions: [ {
				label: 'Play',
				thumbnail: 'img/buttons/play.png',
				link: makeJsLink(`xbmc.Open({ 'item': { 'channelid': ${ broadcastid } } })`)
			} ]
		}))

	}
}))