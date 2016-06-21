import Page from '../js/page'

const mediaToLower = { 'Radio': 'radio', 'TV': 'tv' }

export default (new Page({
	'id': 'Channels',
	'view': 'list',
	'icon': state => state.get('media') === 'Radio' ? 'img/icons/home/radio.png' : 'img/icons/home/livetv.png',
	'parentState': state => new Map([[ 'page', 'Menu' ], [ 'media', state.get('media') ]]),
	'data': state => {

		const m = state.get('media')
		const media = mediaToLower[m] === undefined ? [ 'TV', 'Radio' ] : [ m ]

		let nextpage = ({ 'Channel Group': 'Channel Group', 'Guide': 'Guide' })[state.get('nextpage')]
		if (nextpage === undefined) nextpage = 'Channel Group'

		return Promise.all(media.map(type => {
			return xbmc.get({
				'method': 'PVR.GetChannelGroups',
				'params': {
					'channeltype': mediaToLower[type]
				}
			})
			.then(result => result.channelgroups.map(g => {
				g.link = '#page=' + nextpage + '&media=' + state.get('media') + '&groupid=' + g.channelgroupid
				return g
			}))
			.catch(() => [])
			.then(items => ({
				label: type+' '+({ 'Channel Group': 'Channels', 'Guide': 'Guide' })[nextpage],
				items: items
			}))

		}))
		.then(items => (media.length == 1 ? {
			pageName: items[0].label,
			items: items[0].items
		} : {
			items: items
		}))
		.catch(e => { title: e })

	}
}));