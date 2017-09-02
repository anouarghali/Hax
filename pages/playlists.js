import Page from '../js/page.js'
import { seconds2string, makeJsLink } from '../js/util.js'

export default (new Page({
	'id': 'Playlists',
	'view': 'list',
	'icon': state => 'img/icons/home/playlists.png',
	'parentState': state => ({ 'page': 'Home' }),
	'data': state => {
		
		return xbmc.get({
			'method': 'Playlist.GetPlaylists'
		})
		.then(playlists => playlists.map(playlist => {
			let label = playlist.playlistid + (playlist.type ? ': ' + playlist.type : '')
			return xbmc.get({
				'method': 'Playlist.GetItems',
				'params': {
					'properties': [ 'title', 'showtitle', 'artist', 'season', 'episode', 'file', 'thumbnail', 'runtime', 'duration' ],
					'playlistid': playlist.playlistid
				}
			})
			.then(result => ({
				label: label,
				items: (result.items || []).map((item, i) => {  //format playlist items
					item.details = ''
					if (item.file) item.label = item.file.split('/')[--item.file.split('/').length]
					//if (player.playlistid === playlistid && player.position === i) item.playing = true //TODO: get the item that's currently playing
					item.thumbnail = item.thumbnail ? xbmc.vfs2uri(item.thumbnail) : 'img/icons/default/DefaultVideo.png'
					if (item.runtime) item.details = seconds2string(item.runtime)
					if (item.duration) item.details = seconds2string(item.duration)

					if (!item.playing) {

						item.actions = [
							{
								label: '▶',
								link: makeJsLink(`
									xbmc.get({
										'method': 'Player.Open',
										'params': { 'item': { 'playlistid': ${ playlist.playlistid }, 'position': ${i} } }
									})
								`)
							},
							{ //TODO: should be disabled on the currently playing item
								label: '-',
								link: makeJsLink(`
									xbmc.get({
										'method': 'Playlist.Remove',
										'params': { 'playlistid': ${ playlist.playlistid }, 'position': ${i} }
									})
								`)
							}
						]

					}

					return item
				})
			}))
		})).
		then(playlistItems => Promise.all(playlistItems)).  //wait for the playlists to finish loading
		then(playlists => ({
			items: playlists
		}))

			
	}
}));
