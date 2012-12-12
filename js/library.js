var xbmcLibraryFactory = (function ($) {
	"use strict";

	var LAZYLOAD_OPTIONS = { },
	  pub = {},
	  DEBUG = window.DEBUG || true,
	  
	groupItems = function (items, groupby) {
		var o = [], temp = {};
		if (!(items[0] && items[0][groupby])) return items;
		$.each(items, function (i, item) {
			var s = item[groupby];
			if (item instanceof Object) {
				if (!temp[s]) temp[s] = [];
				temp[s].push(item);
			}
		});
		$.each(temp, function (label, items) {
			o.unshift({
				'label': label,
				'items': items
			});
		});
		return o;
	},
	  
	sortItems = function (items, sortby) {
		if (!(items[0] && items[0][sortby])) return items;
		return items.sort(function (a, b) {
			var x = a[sortby], y = b[sortby];
			if (x < y) return -1;
			if (x > y) return +1;
			return 0;
		});
	},
	  
	seconds2string = function (t) {
		var str = function (n) {
			return (n < 10 && n > -10 ? '0' : '')+Math.floor(n);
		};
		if (t > 3600) return str(t/3600) +':'+ str((t%3600)/60) +':'+ str(t%60);
		else return str(t/60) +':'+ str(t%60);
	},
	  
	minutes2string = function (t) {
		var str = function (n) {
			return (n < 10 && n > -10 ? '0' : '')+Math.floor(n);
		};
		if (t > 60) return str(t/60) +':'+ str(t%60) + ':00';
		return str(t) + ':00';
	},
	  
	ymd2string = function (ymd) {
		var x = ymd.split(' ')[0].split('-');
		return [
			['January','February','March','April','May','June','July','August','September','October','November','December'][x[1]-1], 
			+x[2]+((/1[1-3]$/).test(x[2]) ? 'th' : (/1$/).test(x[2]) ? 'st' : (/2$/).test(x[2]) ? 'nd' : (/3$/).test(x[2]) ? 'rd' : 'th')+',',
			x[0]
		].join(' ');
	},
	  
	pages = {
		'Home': {
			'view': 'list',
			'data': function (callback) {
				var items = [
					{ 'label': 'Videos', 'link': '#page=Menu&media=Videos', 'thumbnail': 'img/icon_video.png' },
					{ 'label': 'Music', 'link': '#page=Menu&media=Music', 'thumbnail': 'img/icon_music.png' },
					{ 'label': 'Pictures', 'link': '#page=Menu&media=Pictures', 'thumbnail': 'img/icon_pictures.png' },
                    { 'label': 'Remote', 'link': '#page=Remote', 'thumbnail':'img/remote.png' },
                    { 'label': 'Playlists', 'link': '#page=Playlists', 'thumbnail':'img/playlist.png' },
                    //{ 'label': 'Settings', 'link': '#page=Settings', 'thumbnail':'img/settings.png' }
				];
				callback({ 'items': items, 'fanart': 'img/backgrounds/default.jpg', 'hideNavigation': true });
			}
		},
		'Remote': {
			'view': 'buttons',
			'data': function (callback) {
				var buttons = [
	                /*{ 'text': 'Up', 'class':'up', 'onclick':function () { xbmc.Up(); } },
	                { 'text': 'Down', 'class':'down', 'onclick':function () { xbmc.Down(); } },
	                { 'text': 'Left', 'class':'left', 'onclick':function () { xbmc.Left(); } },
	                { 'text': 'Right', 'class':'right', 'onclick':function () { xbmc.Right(); } },
	                { 'text': 'Select', 'class':'select', 'onclick':function () { xbmc.Select(); } },
	                { 'text': 'Back', 'class':'back', 'onclick':function () { xbmc.Back(); } },
	                { 'text': 'Information', 'class':'info', 'onclick':function () { xbmc.Info(); } },
	                { 'text': 'Menu', 'class':'menu', 'onclick':function () { xbmc.ContextMenu(); } },
	                { 'text': 'Home', 'class':'home', 'onclick':function () { xbmc.Home(); } }*/
                ];
				callback({ 'title': 'Remote', 'class': 'remote', 'height': '340px', 'width': '340px', 'buttons': buttons });
			},
			'then': function (elem) {
				//text input
				var textContainer = document.createElement('div');
				var textInput = document.createElement('input');
				$(textInput).on('keyup', function (e) {
					var fin = event.which === 13; //was the enter key pressed?
					xbmc.SendText({ 'text': textInput.value, 'done': fin });
					if (fin) textInput.value = '';
				});
				textContainer.classList.add('textInput');
				textContainer.appendChild(textInput);
				elem.appendChild(textContainer);

				//gesture input
				var gestureContainer = document.createElement('div');
				var gestureInput = document.createElement('canvas');
				elem.appendChild(gestureContainer);
				gestureInput.width = $(gestureContainer).width()-18;
				gestureInput.height = $(window).height()-120;
				gestureContainer.classList.add('gestureInput');
				gestureContainer.appendChild(gestureInput);
				dollarCanvas(gestureInput, function (gesture, confidence) {
					xbmc.Action(gesture);
				});

				/*var keymap = {
					37: 'left', 38: 'up', 39: 'right', 40: 'down',
					13: 'select', 8: 'back', 81: 'queue', 27: 'previousmenu', 73: 'info', 67: 'contextmenu',
					80: 'play', 70: 'fastforward', 82: 'rewind', 32: 'pause', 88: 'stop', 190: 'skipnext', 188: 'skipprevious',
					145: 'screenshot', 9: 'fullscreen', 220: 'togglefullscreen',
					189: 'volumedown', 187: 'volumeup', 109: 'volumedown', 107: 'volumeup',
					48: 'number0', 49: 'number1', 50: 'number2', 51: 'number3', 52: 'number4', 53: 'number5', 54: 'number6', 55: 'number7', 56: 'number8', 57: 'number9',
					96: 'number0', 97: 'number1', 98: 'number2', 99: 'number3', 100: 'number4', 101: 'number5', 102: 'number6', 103: 'number7', 104: 'number8', 105: 'number9',
					33: 'pageup', 34: 'pagedown', 36: 'firstpage', 35: 'lastpage'
				};
				var keyboardInput = document.createElement('input');
				$(keyboardInput).on('keydown', function (e) {
					if (keymap[e.which]) xbmc.Action(keymap[e.which]);
					else console.log(e.which);
					e.preventDefault();
				});
				elem.appendChild(keyboardInput);*/

			}
		},
		'Menu': {
			'view': 'list',
			'data': function (callback) {
				var q = Q(), media = getHash('media'),
				m = ({'Videos':'video','Music':'music','Pictures':'pictures'})[media],
				x = ({'Videos':'video','Music':'audio','Pictures':'picture'})[media],
				page = {
					'title': media || 'Menu',
					'items': ({
						'Videos': [
							{ 'label': 'Movies', 'items': [
								{ 'label': 'By Year', 'link': '#page=Movies', 'thumbnail': 'img/DefaultMusicYears.png' },
								{ 'label': 'By Title', 'link': '#page=Movies&group=alpha', 'thumbnail': 'img/DefaultMovies.png' },
								{ 'label': 'By Genre', 'link': '#page=Genres&type=Movies', 'thumbnail': 'img/DefaultMusicGenres.png' }
							] },
							{ 'label': 'TV Shows', 'items': [
								{ 'label': 'By Title', 'link': '#page=TV Shows', 'thumbnail': 'img/DefaultTVShows.png' },
								{ 'label': 'By Genre', 'link': '#page=Genres&type=TV Shows', 'thumbnail': 'img/DefaultMusicGenres.png' }
							] },
							{ 'label': 'Music Videos', 'items': [
								{ 'label': 'By Artist', 'link': '#page=Music Videos', 'thumbnail': 'img/DefaultMusicArtists.png' }
							] }
						],
						'Music': [
							{ 'label': 'Artists', 'items': [
								{ 'label': 'By Name', 'link': '#page=Artists', 'thumbnail': 'img/DefaultMusicArtists.png' },
								{ 'label': 'By Genre', 'link': '#page=Artists&group=genre', 'thumbnail': 'img/DefaultMusicGenres.png' }
							] },
							{ 'label': 'Music Videos', 'items': [
								{ 'label': 'By Artist', 'link': '#page=Music Videos', 'thumbnail': 'img/DefaultMusicArtists.png' }
							] }
						],
						'Pictures': [ ]
					})[media]
				};
				q.add(function (c) { //get files
					xbmc.GetSources({ 'media': m }, function (d) {
						page.items.push({ 'label': 'Files', 'items': (d.sources || []).map(function (source) {
							source.link = '#page=Directory&directory='+encodeURIComponent(source.file)+'&media='+m;
							source.thumbnail = 'img/DefaultFolder.png';
							source.thumbnailWidth = '50px';
							return source;
						})});
						c();
					});
				});
				/*q.add(function (c) { //get playlists
					pages.Playlists.data(function (playlistPage) {
						page.items = page.items.concat(playlistPage.items.filter(function (item) { return item.type == x; }));
						c();
					})
				});*/
				q.onfinish(function () {
					callback(page);
				});
				q.start();
			}
		},
		'Settings': {
			'view': 'settings',
			'data': {
				'items': [
					{ 'label': 'Fanart', 'type': 'checkbox' },
					{ 'label': 'Thumbnails', 'type': 'checkbox' }
				]
			}
		},
		'Genres': {
			'view': 'list',
			'data': function (callback) {
				var page = {}, q = Q();
				q.add(function (c) {
					var type = getHash('type'),
					t = type == 'Movies' ? 'movie' :
						type == 'TV Shows' ? 'tvshow' :
						type == 'Music Videos' ? 'musicvideo' : '',
					getGenres = type === 'Artists' ? xbmc.GetAudioGenres : function (x) { xbmc.GetVideoGenres({ 'type': t }, x) };
					page.title = type;
					page.subtitle = 'by genre';
					getGenres(function (d) {
						page.items = d.genres instanceof Array ? d.genres.map(function (genre) {
							return { 'label': genre.label, 'link': '#page='+type+'&genre='+genre.label }
						}) : [];
						c();
					});
				});
				q.onfinish(function () {
					callback(page);
				});
				q.start();
			}
		},
		'Movies': {
			'view': 'list',
			'groupby': 'year',
			'data': function (callback) {
				var page = { title: 'Movies' }, q = Q();
				q.add(function (c) { //get movies
					var year = getHash('year'),
						genre = getHash('genre'),
					filter = year ? function (movie) { if (year == movie.year) return true; } :
						genre ? function (movie) { if (movie.genre.indexOf(genre) >= 0) return true; } :
						function () { return true; };
					xbmc.GetMovies(function (d) {
						page.items = d.movies instanceof Array ? d.movies.filter(filter) : [];
						c();
					});
				});
				q.add(function (c) { //format movies
					$.each(page.items, function (i, movie) {
						movie.link = '#page=Movie&movieid='+movie.movieid;
						movie.alpha = movie.label[0].toUpperCase();
						if (movie.movieid) {
							movie.play = function () {
								xbmc.Play({ 'movieid': movie.movieid }, 1);
								//xbmc.Open({ 'item': { 'path': xbmc.vfs2uri(movie.file) } });
							};
							movie.add = function () {
								xbmc.AddToPlaylist({ 'playlistid': 1, 'item': { 'movieid': movie.movieid } });
							};
						}
						//if (movie.fanart) movie.thumbnail = movie.fanart; fanart takes too long to load
						movie.thumbnail = movie.thumbnail ? xbmc.vfs2uri(movie.thumbnail) : 'img/DefaultVideo.png';
						movie.thumbnailWidth = '34px';
						movie.details = [];
						if (movie.genre) movie.details.push(movie.genre);
						//movie.details.push( minutes2string(movie.runtime || 0) );
					});
					c();
				});
				q.onfinish(function () {
					callback(page);
				});
				q.start();
			}
		},
		'Movie': {
			'view': 'list',
			'parent': 'Movies',
			'data': function (callback) {
				var page = {}, q = Q();
				var movieid = +getHash('movieid');
				q.add(function (c) { //get movie details
					xbmc.GetMovieDetails({ 'movieid': movieid }, function (d) {
						page = d.moviedetails || {};
						c();
					});
				});
				q.add(function (c) { //format movie details
					if (page.year) page.title += ' ('+page.year+')';
					if (page.tagline) page.subtitle = page.tagline;
					if (page.movieid) {
						page.play = function () {
							xbmc.Play({ 'movieid': page.movieid }, 1);
						};
						page.add = function () {
							xbmc.AddToPlaylist({ 'playlistid': 1, 'item': { 'movieid': page.movieid } });
						};
					}
					if (page.trailer) page.trailer = function () {
						xbmc.Play(page.trailer, 1);
					};
					if (page.thumbnail) page.thumbnail = xbmc.vfs2uri(page.thumbnail);
					if (page.fanart) page.fanart = xbmc.vfs2uri(page.fanart);
					c();
				});
				q.onfinish(function () {
					callback(page);
				});
				q.start();
			}
		},
		'TV Shows': {
			'view': 'list',
			'groupby': 'alpha',
			'data': function (callback) {
				var page = { title: 'TV Shows' }, q = Q();
				q.add(function (c) { //get tv shows
					var year = getHash('year'),
						genre = getHash('genre'),
						filter = year ? function (show) { if (year == show.year) return true; } :
							genre ? function (show) { if (show.genre.indexOf(genre) >= 0) return true; } :
							function () { return true; };
					xbmc.GetTVShows(function (d) {
						page.items = d.tvshows instanceof Array ? d.tvshows.filter(filter) : [];
						c();
					});
				});
				q.add(function (c) { //format tv shows
					$.each(page.items, function (i, tvshow) {
						tvshow.link = '#page=TV Show&tvshowid='+tvshow.tvshowid;
						if (tvshow.thumbnail) tvshow.thumbnail = xbmc.vfs2uri(tvshow.thumbnail);
						//if (tvshow.art) tvshow.thumbnail = xbmc.vfs2uri(tvshow.art.thumbnail);
						tvshow.alpha = tvshow.label[0].toUpperCase();
					});
					c();
				});
				q.onfinish(function () {
					callback(page);
				});
				q.start();
			}
		},
		'TV Show': {
			'view': 'list',
			'parent': 'TV Shows',
			'groupby': 'season',
			'sortgroup': 'season',
			'data': function (callback) {
				var page = {}, tvshowid = +getHash('tvshowid');
				Q().
				  add(function (c) { //get show details
					xbmc.GetTVShowDetails({ 'tvshowid': tvshowid }, function (d) {
						page = d.tvshowdetails || {};
						c();
					});
				  }).
				  add(function (c) { //format show details
					//if (page.fanart) page.fanart = xbmc.vfs2uri(page.fanart);
					if (page.art) page.banner = xbmc.vfs2uri(page.art.banner);
					delete page.thumbnail;
					c();
				  }).
				  add(function (c) { //get episodes
					xbmc.GetTVEpisodes({ 'tvshowid': tvshowid }, function (d) {
						page.items = d.episodes || {};
						c();
					});
				  }).
				  add(function (c) { //format episodes
					$.each(page.items, function (i, episode) {
						episode.play = function () {
							xbmc.Play({ 'episodeid': episode.episodeid }, 1);
						};
						episode.add = function () {
							xbmc.AddToPlaylist({ 'playlistid': 1, 'item': { 'episodeid': episode.episodeid } });
						};
						episode.link = '#page=Episode&episodeid='+episode.episodeid+'&tvshowid='+tvshowid;
						episode.label = episode.title || '';
						if (episode.episode) episode.number = episode.episode;
						episode.thumbnail = episode.thumbnail ? xbmc.vfs2uri(episode.thumbnail) : 'img/DefaultVideo.png';
						episode.season = 'Season '+episode.season;
						episode.thumbnailWidth = '89px';
						episode.details = [];
						if (episode.runtime) episode.details.push( minutes2string(episode.runtime) );
						if (episode.lastplayed) episode.details.push( 'Last played '+ymd2string(episode.lastplayed) );
						//episode.details.push( minutes2string(episode.runtime || 0) );
					});
					c();
				  }).
				  onfinish(function () {
					callback(page);
				  }).
				  start();
			}
		},
		'Episode': {
			'view': 'list',
			'parent': 'TV Shows',
			'data': function (callback) {
				var page = {}, tvshowid = +getHash('tvshowid'), episodeid = +getHash('episodeid');
				Q().
				  add(function (c) { //get episode details
					xbmc.GetEpisodeDetails({ 'episodeid': episodeid }, function (d) {
						page = d.episodedetails || {};
						c();
					});
				  }).
				  add(function (c) { //format episode details
					page.subtitle = (page.season>0 && page.episode>0 ? page.season+'x'+(page.episode<10 ? '0' : '')+page.episode+' ' : '')+(page.title || page.showtitle || '');
					if (tvshowid) page.link = '#page=TV Show&tvshowid='+tvshowid;
					if (page.showtitle) page.title = page.showtitle;
					if (episodeid !== undefined) {
						page.play = function () {
							xbmc.Play({ 'episodeid': episodeid }, 1);
						};
						page.add = function () {
							xbmc.AddToPlaylist({ 'playlistid': 1, 'item': { 'episodeid': episodeid } });
						};
					}
					if (page.thumbnail) page.thumbnail = xbmc.vfs2uri(page.thumbnail);
					if (page.fanart) page.fanart = xbmc.vfs2uri(page.fanart);
					if (page.runtime) page.runtime += ' minutes';
					c();
				  }).
				  onfinish(function () {
					callback(page);
				  }).
				  start();
			}
		},
		'Music Videos': {
			'view': 'list',
			'groupby': 'artist',
			'data': function (callback) {
				var page = { title: 'Music Videos' }, q = Q();
				q.add(function (c) { //get music videos
					xbmc.GetMusicVideos(function (d) {
						page.items = d.musicvideos || [];
						c();
					});
				});
				q.add(function (c) { //format music videos
				  	$.each(page.items, function (i, mv) {
				  		mv.artist = mv.artist.join(', ');
				  		mv.label = mv.title;
				  		mv.details = (mv.album ? mv.album+(mv.year ? ' ('+mv.year+')' : '') : '');
						mv.play = function () {
							xbmc.Play({ 'file': mv.file }, 1);
						};
						mv.add = function () {
							xbmc.AddToPlaylist({ 'playlistid': 1, 'item': { 'file': mv.file } });
						};
					});
					c();
				});
				q.onfinish(function () {
					callback(page);
				});
				q.start();
			}
		},
		'Artists': {
			'view': 'list',
			'groupby': 'alpha',
			'data': function (callback) {
				var page = { title: 'Artists' }, q = Q(),
				genre = getHash('genre'),
				alpha = getHash('alpha')//,
				//filter = genre ? function (artist) { if (artist.genre.indexOf(genre) >= 0) return true; } :
				//	alpha ? function (artist) { if (artist.artist[0] == alpha) return true; } :
				//	function (artist) { return true; };
				q.add(function (c) { //get artists
					xbmc.GetArtists(function (d) {
						page.items = d.artists/*.filter(filter)*/ || [];
						c();
					});
				});
				q.add(function (c) { //format artists
				  	$.each(page.items, function (i, artist) {
				  		artist.alpha = artist.label[0].toUpperCase();
						artist.link = '#page=Artist&artistid='+artist.artistid;
						artist.thumbnail = artist.thumbnail ? xbmc.vfs2uri(artist.thumbnail) : 'img/DefaultArtist.png';
						artist.thumbnailWidth = '50px';
						if (artist.genre instanceof Array) artist.genre.map(function (genre) { return genre.charAt(0).toUpperCase()+genre.charAt(0).toUpperCase()+genre.substr(1) });
						artist.details = artist.genre || ' ';
					});
					c();
				});
				q.onfinish(function () {
					callback(page);
				});
				q.start();
			}
		},
		'Artist': {
			'view': 'list',
			'groupby': 'year',
			'data': function (callback) {
				var page = {}, artistid = +getHash('artistid');
				Q().
				  add(function (c) { //get artist details
					xbmc.GetArtistDetails({ 'artistid': artistid }, function (d) {
						page = d.artistdetails || {};
						c();
					});
				  }).
				  add(function (c) { //format artist details
					if (page.thumbnail) page.thumbnail = xbmc.vfs2uri(page.thumbnail);
					//if (page.fanart) page.fanart = xbmc.vfs2uri(page.fanart);
					page.title = page.label || 'Artist '+artistid;
					c();
				  }).
				  add(function (c) { //get albums
					xbmc.GetAlbums({ 'filter': { 'artistid': artistid } }, function (d) {
						page.items = d.albums || [];
						c();
					});
				  }).
				  add(function (c) { //format albums
					$.each(page.items, function (i, album) {
						album.link = '#page=Album&albumid='+album.albumid;
						album.thumbnail = album.thumbnail ? xbmc.vfs2uri(album.thumbnail) : 'img/DefaultAudio.png';
						album.thumbnailWidth = '50px';
						//if (album.year) album.details = album.year;
						album.play = function () {
							xbmc.Play({ 'albumid': album.albumid }, 0);
						};
						album.add = function () {
							xbmc.AddToPlaylist({ 'playlistid': 0, 'item': { 'albumid': album.albumid } });
						};
					});
					c();
				  }).
				  onfinish(function () {
					callback(page);
				  }).
				  start();
			}
		},
		'Album': {
			'view': 'list',
			'parent': 'Music',
			'data': function (callback) {
				var page = {}, albumid = +getHash('albumid');
				Q().
				  add(function (c) { //get album details
					xbmc.GetAlbumDetails({ 'albumid': albumid }, function (d) {
						page = d.albumdetails || {};
						c();
					});
				  }).
				  add(function (c) { //format album details
					if (page.thumbnail) page.thumbnail = xbmc.vfs2uri(page.thumbnail);
					if (page.fanart) page.fanart = xbmc.vfs2uri(page.fanart);
					page.title = page.artist.join(', ') || '';
					page.link = '#page=Artist&artistid='+page.artistid;
					page.subtitle = page.label || '';
					page.play = function () {
						xbmc.Play({ 'albumid': albumid }, 0);
					};
					page.add = function () {
						xbmc.AddToPlaylist({ 'playlistid': 1, 'item': { 'albumid': albumid } });
					};
					c();
				  }).
				  add(function (c) { //get songs
					xbmc.GetSongs({ 'filter': { 'albumid': albumid } }, function (d) {
						page.items = d.songs || [];
						c();
					});
				  }).
				  add(function (c) { //format songs
				  	console.dir(page.items)
					$.each(page.items, function (i, song) {
						if (song.track <= 10000) song.number = song.track;
						song.thumbnail = undefined;
						song.thumbnailWidth = '50px';
						if (song.file) {
							song.play = function () {
								//xbmc.Play(song.file, 0);
								xbmc.Play({ 'albumid': albumid }, 0, song.track-1);
							};
							song.add = function () {
								xbmc.AddToPlaylist({ 'playlistid': 1, 'item': { 'file': song.file } });
							};
						}
						if (song.duration) song.details = seconds2string(song.duration);
					});
					c();
				  }).
				  onfinish(function () {
					callback(page);
				  }).
				  start();
			}
		},
		'Files': {
			'view': 'list',
			'data': function (callback) {
				var page = { 'title': 'Files', 'items': [
					{ 'media': 'video', 'label': 'Video' },
					{ 'media': 'music', 'label': 'Music' },
					{ 'media': 'pictures', 'label': 'Pictures' },
					{ 'media': 'files', 'label': 'Files' }
				  ] }, 
				  q = Q(),
				  media = getHash('media');
				if (media) page.items = page.items.filter(function (item) { return item.label == media; });
				$.each(page.items, function (i, item) {
					q.add(function (c) { //get sources
						xbmc.GetSources({ 'media': item.media }, function (d) {
							item.items = d.sources || [];
							c();
						});
					});
					q.add(function (c) { //format sources
						$.each(item.items, function (i, source) {
							source.link = '#page=Directory&directory='+encodeURIComponent(source.file)+'&media='+item.media;
							source.thumbnail = 'img/DefaultFolder.png';
							source.thumbnailWidth = '50px';
						});
						c();
					});
				});
				q.onfinish(function () {
					callback(page);
				});
				q.start();
			}
		},
		'Directory': {
			'view': 'list',
			'parent': 'Files',
			'data': function (callback) {
				var directory = getHash('directory'), page = {}, media = getHash('media') || '';
				Q().
				  add(function (c) { //get files
					xbmc.GetDirectory({ 'directory': directory, 'media': media }, function (d) {
						page.subtitle = directory.substring(0,12) === 'multipath://' ? decodeURIComponent(directory.substring(12, directory.length-1)) : directory;
						var directoryArray = page.subtitle.split('/');
						page.title = directoryArray[directoryArray.length-2];
						page.items = d.files || [];
						c();
					});
				  }).
				  add(function (c) { //format files
					$.each(page.items, function (i, file) {
						var f = file.file.split('/'),
						  filename = f.pop();
						if (file.filetype === 'directory') {
							file.link = '#page=Directory&directory='+encodeURIComponent(file.file)+'&media='+getHash('media');
							if (!file.thumbnail) file.thumbnail = 'img/DefaultFolder.png';
						}
						if (file.filetype === 'file') {
							file.play = function () {
								if (file.type === 'unknown' || !file.type) file.type = getHash('media');
								xbmc.Play(file.file, file.type === 'audio' ? 0 : file.type === 'video' ? 1 : 2);
								//xbmc.Open({ 'item': { 'file': xbmc.vfs2uri(file.file) } });
							};
							file.add = function () {
								xbmc.AddToPlaylist({ 'playlistid': 1, 'item': { 'file': file.file } });
							};
							file.thumbnail = file.thumbnail ? xbmc.vfs2uri(file.thumbnail) : 'img/DefaultFile.png';
							file.details = [];
							file.details.push( Math.round((file.size||0)/1024)+'MB' );
							if (file.mimetype) file.details.push( !file.type || (file.type === 'unknown') ? file.mimetype : file.type );
						}
						if (!filename) filename = f.pop();
						file.label = filename;
						file.thumbnailWidth = '50px';
					});
					c();
				  }).
				  add(function (c) { //add back button
					var path = directory.split('/'), back = '';
					if (!path.pop()) path.pop(); //remove the last part of the current directory
					back = path.join('/');					
					if (path.length > 2) page.items.unshift({
						'link': '#page=Directory&directory='+back+'&media='+getHash('media'),
						'label': ' . . ',
						'thumbnail': 'img/DefaultFolderBack.png',
						'thumbnailWidth': '50px'
					});
					c();
				  }).
				  onfinish(function () {
					callback(page);
				  }).
				  start();
			}
		},
		'Playlists': {
			'view': 'list',
			'data': function (callback) {
				var page = { 'title': 'Playlists' }, player;
				Q().
				  add(function (c) { //get playlists
					xbmc.GetPlaylists(function (d) {
						page.items = d || [];
						c();
					});
				  }).
				  add(function (c) {
					var q = Q();
		  			$.each(page.items, function (i, item) { //for each playlist
		  				item.label = item.type || 'Playlist';
		  				q.add(function(cb) { //get playlist items
			  				xbmc.GetPlaylistItems({ 'playlistid': item.playlistid }, function (d) {
			  					item.items = d.items || [];
			  					cb();
			  				});
			  			});
					});
					q.onfinish(function () {
						c();
					});
					q.start();
				  }).
				  add(function (c) { //get active player
					xbmc.GetActivePlayerProperties(function (d) {
						player = d || {};
						c();
					});
				  }).
				  add(function (c) { //format playlist items
		  			$.each(page.items, function (i, item) {
		  				var playlistid = item.playlistid || 0;
			  			$.each(item.items, function (i, item) {
							if (item.file) item.label = item.file.split('/')[--item.file.split('/').length];
							if (player.playlistid === playlistid && player.position === i) item.playing = true;
							if (!item.playing) {
								item.play = function () {
									xbmc.Open({ 'item': { 'playlistid': playlistid, 'position': i } });
									renderPage(); //refresh the playlist
								};
								item.remove = function () {
									xbmc.RemoveFromPlaylist({ 'playlistid': playlistid, 'position': i });
									renderPage(); //refresh the playlist
								};
							}
							if (item.thumbnail) item.thumbnail = xbmc.vfs2uri(item.thumbnail);
							item.details = '';
							if (item.runtime) item.details = minutes2string(item.runtime);
							if (item.duration) item.details = seconds2string(item.duration);
						});
					});
					c();
				  }).
				  onfinish(function () {
					callback(page);
				  }).
				  start();
			}
		}
	},
	cache = {},
	renderPage = function (title) {
		var data, page, defaultPage = 'Home', hash = document.location.hash.replace(/\W/g,'');
		
		//find the page to render
		if (!title) title = getHash('page') || defaultPage;
		title = title.replace('%20',' '); //some browsers replace spaces with %20
		page = pages[title];
		if (!page) page = pages[defaultPage];
		
		if (DEBUG) console.log('Library: Fetching data: '+title);
		
		//if the data isn't a function, turn it into one
		if (!page.data) data = function (callback) { callback({}) };
		else if (!(page.data instanceof Function)) data = function (callback) { callback(page.data) };
		else data = page.data;

		//get the page data
		data(function (data) {
			var groupby = getHash('group') || page.groupby;
			if (DEBUG) console.log('Library: Rendering page: '+title, data);
			
			//sort and group the data
			if (getHash('sort') || page.sortby) data.items = sortItems(data.items, getHash('sort') || page.sortby)
			if (groupby) {
				var size = data.items.length;
				data.groupby = groupby;
				data.items = sortItems(groupItems(data.items, groupby), 'label');
				if (getHash(groupby)) data.items = data.items.filter(function (x) {
					return x.label === getHash(groupby);
				});
				else if (size > 50) {
					data.collapsed = true;
					data.items = data.items.map(function (x) {
						return {
							'label': x.label,
							'link': document.location.hash+'&'+groupby+'='+x.label
						}
					});
				}
			}

			data.id = title;
			document.title = 'XBMC'+(data.title ? ' - '+data.title : ' Simple Remote');
			
			//render the data to the DOM via the template
			var p = $('<div class="page" data-page="'+title+'"></div>'),
			v = $(template[getHash('view') || page.view].bind(data)).appendTo(p);
			$('#content').empty().append(p);
			if (page.then instanceof Function) page.then(p.get(0));
			
			//apply javascript UI hacks
			$('body').scrollTop(0);
			$('#loading').stop(true).hide();
			v.find('img').filter('[data-original]').lazyload(LAZYLOAD_OPTIONS); //initialize the lazyload plugin
		});
		
		//select and scroll to the appropriate button in the header
		//if (page.parent) buttons.select(page.parent);
		//else buttons.select(title);
	};
	
	return function () {
		//render the buttons
		//buttons.render();
	
		//render the page
		renderPage(getHash('page') || undefined);
		
		//render the page every time the hash changes
		$(window).hashchange(function () {
			$('#loading').show();
			renderPage(getHash('page'));
		});
		
		return pub;
	};

})(jQuery);
