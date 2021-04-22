var background = (function () {
  var tmp = {};
  var context = document.documentElement.getAttribute("context");
  if (context === "webapp") {
    return {
      "send": function () {},
      "receive": function (callback) {}
    }
  } else {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      for (var id in tmp) {
        if (tmp[id] && (typeof tmp[id] === "function")) {
          if (request.path === "background-to-interface") {
            if (request.method === id) tmp[id](request.data);
          }
        }
      }
    });
    /*  */
    return {
      "receive": function (id, callback) {tmp[id] = callback},
      "send": function (id, data) {chrome.runtime.sendMessage({"path": "interface-to-background", "method": id, "data": data})}
    }
  }
})();

var config = {
  "element": {
    "status": null,
  },
  "notifications": {
    "create": function (message) {
      window.alert(message);
    }
  },
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    },
    "page": {
      "edit": "https://mybrowseraddon.com/page-edit.html",
      "draw": "https://mybrowseraddon.com/draw-on-page.html",
      "webapp": "https://webbrowsertools.com/screen-recorder/"
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
      config.resize.timeout = window.setTimeout(function () {
        config.storage.write("size", {
          "width": window.innerWidth || window.outerWidth,
          "height": window.innerHeight || window.outerHeight
        });
      }, 1000);
    }
  },
  "convert": {
    "seconds": {
      "to": {
        "hhmmss": function (e) {
          var input = parseInt(e, 10);
          var hours   = Math.floor(input / 3600);
          var minutes = Math.floor((input - (hours * 3600)) / 60);
          var seconds = input - (hours * 3600) - (minutes * 60);
          /*  */
          if (hours < 10) hours = '0' + hours;
          if (minutes < 10) minutes = '0' + minutes;
          if (seconds < 10) seconds = '0' + seconds;
          /*  */
          return hours + ':' + minutes + ':' + seconds;
        }
      }
    }
  },
  "permissions": {
    "query": async function (options) {
      return await new Promise(function (resolve, reject) {
        var firefox = navigator.userAgent.toLowerCase().indexOf("firefox");
        if (firefox) {
          resolve({"state": "unsupported"});
        } else {
          try {
            if ("permissions" in navigator) {
              navigator.permissions.query(options).then(resolve).catch(function (e) {
                resolve({"state": undefined});
                config.notifications.create("Error! could not query required permissions!");
              });
            } else {
              resolve({"state": undefined});
              config.notifications.create("Error! 'permissions' is not available!");
            }
          } catch (e) {
            resolve({"state": undefined});
            config.notifications.create("Error! 'permissions' is not available!");
          }
        }
      });
    }
  },
  "options": {
    "inteface": {
      set minimize (val) {config.storage.write("inteface-minimize", val)},
      get minimize () {return config.storage.read("inteface-minimize") !== undefined ? config.storage.read("inteface-minimize") : true}
    },
    "quality": {
      set id (val) {config.storage.write("quality-id", val)},
      set name (val) {config.storage.write("quality-name", val)},
      get id () {return config.storage.read("quality-id") !== undefined ? config.storage.read("quality-id") : ''},
      get name () {return config.storage.read("quality-name") !== undefined ? config.storage.read("quality-name") : "default"}
    },
    "video": {
      "source": {
        set id (val) {config.storage.write("video-source-id", val)},
        set name (val) {config.storage.write("video-source-name", val)},
        get id () {return config.storage.read("video-source-id") !== undefined ? config.storage.read("video-source-id") : ''},
        get name () {return config.storage.read("video-source-name") !== undefined ? config.storage.read("video-source-name") : "screen"}
      }
    },
    "audio": {
      "source": {
        set id (val) {config.storage.write("audio-source-id", val)},
        set name (val) {config.storage.write("audio-source-name", val)},
        get id () {return config.storage.read("audio-source-id") !== undefined ? config.storage.read("audio-source-id") : ''},
        get name () {return config.storage.read("audio-source-name") !== undefined ? config.storage.read("audio-source-name") : "system"}
      }
    }
  },
  "button": {
    "icon": function (e) {
      if (chrome) {
        if (chrome.browserAction) {
          if (chrome.browserAction.setIcon) {
            chrome.browserAction.setIcon({
              "path": {
                "16": "../../data/icons/" + (e ? e + '/' : '') + "16.png",
                "32": "../../data/icons/" + (e ? e + '/' : '') + "32.png",
                "48": "../../data/icons/" + (e ? e + '/' : '') + "48.png",
                "64": "../../data/icons/" + (e ? e + '/' : '') + "64.png"
              }
            });
          }
        }
      }
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          var tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "downloads": {
    "start": function (options, callback) {
      if (chrome.downloads) {
        chrome.downloads.download(options, function (e) {
          if (callback) callback(e);
        });
      }
    },
    "search": function (options, callback) {
      if (chrome.downloads) {
        chrome.downloads.search(options, function (e) {
          if (callback) callback(e);
        });
      }
    },
    "on": {
      "changed": function (callback) {
        if (chrome.downloads) {
          chrome.downloads.onChanged.addListener(function (e) {
            callback(e);
          });
        }
      }
    }
  },
  "app": {
    "start": async function () {
      config.button.icon(null);
      config.recorder.file.restore();
      /*  */
      var permission = await config.permissions.query({"name": "microphone"});
      if (permission.state === "prompt") {
        if (config.options.audio.source.name === "mixed" || config.options.audio.source.name === "microphone") {
          config.options.audio.source.id = null;
          config.options.audio.source.name = "system";
        }
      }
      /*  */
      var minimize = document.querySelector("input[id='minimize']");
      var context = document.documentElement.getAttribute("context");
      var quality = document.querySelector("input[id='" + config.options.quality.name + "']");
      var video = document.querySelector("input[id='" + config.options.video.source.name + "']");
      var audio = document.querySelector("input[id='" + config.options.audio.source.name + "']");
      /*  */
      if (video) video.checked = true;
      if (audio) audio.checked = true;
      if (quality) quality.checked = true;
      if (minimize) minimize.checked = config.options.inteface.minimize;
      config.recorder.api.version = chrome && chrome.desktopCapture && chrome.desktopCapture.chooseDesktopMedia ? "old" : "new";
      /*  */
      minimize.addEventListener("change", function (e) {
        config.options.inteface.minimize = e.target.checked;
      });
      /*  */
      window.setTimeout(function () {
        config.element.logo.removeAttribute("init");
        config.element.status.textContent = "Screen recorder is ready.";
      }, 1500);
      /*  */
      if (context === "webapp") {
        document.querySelector(".row[category='settings']").setAttribute("disabled", '');
      } else {
        document.querySelector(".row[category='settings']").removeAttribute("disabled");
      }
      /*  */
      if (config.recorder.api.version === "new") {
        document.querySelector(".row[category='video']").setAttribute("disabled", '');
        document.querySelector(".row[category='audio']").setAttribute("disabled", '');
        config.element.status.textContent = "API >> navigator -> mediaDevices -> getDisplayMedia";
      } else {
        document.querySelector(".row[category='video']").removeAttribute("disabled");
        document.querySelector(".row[category='audio']").removeAttribute("disabled");
        config.element.status.textContent = "API >> chrome -> desktopCapture -> chooseDesktopMedia";
      }
      /*  */
      config.downloads.on.changed(function (e) {
        if (e) {
          if (e.id === config.recorder.file.disk.id) {
            config.downloads.search({"id": e.id}, function (arr) {
              if (arr && arr.length) {
                if (arr[0].state) {
                  if (arr[0].state === "complete") {
                    var filename = arr[0].filename ? ' to: \n\n' + arr[0].filename : '.';
                    config.notifications.create("The recorded screen is downloaded" + filename);
                  }
                }
              }
            });
          }
        }
      });
      /*  */
      var inputs = [...document.querySelectorAll("input[type='radio']")];
      if (inputs && inputs.length) {
        for (var i = 0; i < inputs.length; i++) {
          inputs[i].addEventListener("change", function (e) {
            if (e) {
              if (e.target) {
                var name = e.target.name;
                var value = e.target.value;
                /*  */
                if (name) {
                  if (value) {
                    if (name === "quality") {
                      config.options.quality.name = value;
                    }
                    /*  */
                    if (name === "video-source") {
                      config.options.video.source.name = value;
                    }
                    /*  */
                    if (name === "audio-source") {
                      if (value === "mixed" || value === "microphone") {
                        navigator.mediaDevices.getUserMedia({"video": false, "audio": true}).then(function (stream) {                      
                          config.options.audio.source.name = value;
                          config.options.audio.source.id = stream.id;
                        });
                      } else {
                        config.options.audio.source.id = null;
                        config.options.audio.source.name = value;
                      }
                    }
                  }
                }
              }
            }
          });
        }
      }
    }
  },
  "load": function () {
    var draw = document.getElementById("draw");
    var edit = document.getElementById("edit");
    var webapp = document.getElementById("webapp");
    var reload = document.getElementById("reload");
    var support = document.getElementById("support");
    var donation = document.getElementById("donation");
    var labels = [...document.querySelectorAll("label")];
    var options = [...document.querySelectorAll(".option")];
    /*  */
    config.element.elapsed = document.querySelector(".elapsed");
    config.element.status = document.querySelector(".status");
    config.element.start = document.querySelector(".start");
    config.element.logo = document.querySelector(".logo");
    config.element.logo.setAttribute("init", '');
    /*  */
    reload.addEventListener("click", function () {
      document.location.reload();
    });
    /*  */
    draw.addEventListener("click", function (e) {
      var url = config.addon.page.draw;
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    edit.addEventListener("click", function (e) {
      var url = config.addon.page.edit;
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    webapp.addEventListener("click", function (e) {
      var url = config.addon.page.webapp;
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    support.addEventListener("click", function (e) {
      var url = config.addon.homepage();
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    donation.addEventListener("click", function (e) {
      var url = config.addon.homepage() + "?reason=support";
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    options.forEach(function (option) {
      option.addEventListener("click", function (e) {
        var input = e.target.querySelector("input");
        if (input) input.click();
      });
    });
    /*  */
    config.element.start.addEventListener("click", function () {
      var recording = config.recorder.engine && config.recorder.engine.state !== "inactive";
      if (recording) {
        config.recorder.stop();
      } else {
        if (config.recorder.api.version) {
          config.recorder.context = new AudioContext();
          config.recorder.start[config.recorder.api.version]();
        } else {
          config.notifications.create("Error! screen recorder is not ready.");
          config.element.status.textContent = "Screen recorder is not ready!";
        }
      }
    });
    /*  */
    labels.forEach(function (label) {
      label.addEventListener("mouseenter", function (e) {
        config.element.status.textContent = e.target ? e.target.dataset.title : '';
      });
      /*  */
      label.addEventListener("mouseleave", function (e) {
        window.setTimeout(function () {
          config.element.status.textContent = '';
        }, 100);
      });
    });
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  }
};

background.receive("button", function () {
  var state = config.element.start.textContent;
  if (state === "STOP") {
    config.element.start.click();
  }
});

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.method, false);