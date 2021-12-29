    function createElementID() {
      var random = "";
      while (random == "") {
        random = Math.random().toString(36).slice(2);
      }
      return "sm" + random;
    }

    function updateCodeMirror(data){
      var cm = editor;
      var doc = cm.getDoc();
      var cursor = doc.getCursor();
      var line = doc.getLine(cursor.line);
      var pos = {
          line: 0,
          ch: 0
      }
      doc.replaceRange(data, pos);
    }

    function validate() {
      var domParser = new DOMParser().parseFromString(editor.getValue(), 'text/html');
      var validXML = new XMLSerializer().serializeToString(domParser);
      var doc = editor.getDoc();
      doc.replaceRange(validXML, {line:0, ch:0}, {line:editor.lineCount()});

    }

    function beautify() {

      validate();

      var totalLines = editor.lineCount();
      editor.autoFormatRange({line:0, ch:0}, {line:totalLines});

      var totalLinesCSS = customCSS.lineCount();
      customCSS.autoFormatRange({line:0, ch:0}, {line:totalLinesCSS});
    }

    function handleNewID(id, obj) {
      if (document.getElementById("renameIds").checked) {
        return handleNewName(id, obj);
      } else {
        return id;
      }
    }

    function handleNewName(id, obj) {
      if(obj[id] == undefined) {
        var newId = createElementID() + "_" + id;
        Object.assign(obj, {[id]: newId});
        return newId;
      }
      return obj[id];

    }

    function containsTags(lineText) {
      var contains = []
      var tags = [
        "a",
        "abbr",
        "acronym",
        "address",
        "applet",
        "area",
        "article",
        "aside",
        "audio",
        "b",
        "base",
        "basefont",
        "bb",
        "bdo",
        "big",
        "blockquote",
        "body",
        "br",
        "button",
        "canvas",
        "caption",
        "center",
        "cite",
        "code",
        "col",
        "colgroup",
        "command",
        "datagrid",
        "datalist",
        "dd",
        "del",
        "details",
        "dfn",
        "dialog",
        "dir",
        "div",
        "dl",
        "dt",
        "em",
        "embed",
        "eventsource",
        "fieldset",
        "fieldsetv",
        "figcaption",
        "figure",
        "font",
        "footer",
        "form",
        "frame",
        "frameset",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "head",
        "header",
        "hgroup",
        "hr",
        "html",
        "i",
        "iframe",
        "img",
        "input",
        "ins",
        "isindex",
        "kbd",
        "keygen",
        "label",
        "legend",
        "li",
        "link",
        "map",
        "mark",
        "menu",
        "meta",
        "meter",
        "nav",
        "noframes",
        "noscript",
        "object",
        "ol",
        "optgroup",
        "option",
        "output",
        "p",
        "param",
        "pre",
        "progress",
        "q",
        "rp",
        "rt",
        "ruby",
        "s",
        "samp",
        "script",
        "section",
        "select",
        "small",
        "source",
        "span",
        "strike",
        "strong",
        "style",
        "sub",
        "sup",
        "table",
        "tbody",
        "td",
        "textarea",
        "tfoot",
        "th",
        "thead",
        "time",
        "title",
        "tr",
        "track",
        "tt",
        "u",
        "ul",
        "var",
        "video",
        "wbr",
      ];

      for(var i=0; i<tags.length; i++) {
        var regex = new RegExp("(?<= |{|\\[|:|,|\\.|>|\\+|~|=|~=|\\||=|^=|$=|\\*=|\\*)" + escapeRegExp(tags[i]) + "(?= |{|\\[|:|,|\\.|>|\\+|~|=|~=|\\||=|^=|$=|\\*=|\\*)", "g");
        var matches = lineText.match(regex);
        if(matches != null) {
          contains.push(tags[i]);
          if (uniqueTags[tags[i]] == undefined) {
            var newId = createElementID() + "_" + tags[i];
            Object.assign(uniqueTags, {[tags[i]]: newId});
          }
        }
      }

      return contains;
    }


    function escapeRegExp(stringToGoIntoTheRegex) {
        return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    function autoFormatSelection() {
      beautify();

      var doc = editor.getDoc();
      var docCSS = customCSS.getDoc();

      if (document.getElementById("uniqueIds").checked) {

        uniqueIds = {};

        var updatedTotalLines = editor.lineCount();

        for (var i=0; i<updatedTotalLines; i++) {

          var lineText = doc.getLine(i);

          if (lineText != null && !lineText.includes("<!") && !lineText.includes("</") && lineText.includes("<") && lineText.includes(">")) {
            if(!lineText.includes(' id="sm')) {
              if (lineText.includes(' id="')) {
                var matches = lineText.match(/(?<= id=").+?(?=")/g);
                if(matches != null) {
                  lineText = lineText.replace(/id="(.*?)"/g, 'id="' + handleNewID(matches[0], uniqueIds) + '"');
                  doc.replaceRange(lineText, {line:i, ch:0}, {line:i});
                }
              }
              else {
                lineText = lineText.replace('>', ' id="' + createElementID() + '">');
                doc.replaceRange(lineText, {line:i, ch:0}, {line:i});
              }
            }
          }
        }
      }

      if (document.getElementById("renameIds").checked) {

        var updatedTotalLinesCSS = customCSS.lineCount();

        for (var i=0; i<updatedTotalLinesCSS; i++) {

          var lineText = docCSS.getLine(i);

          if (lineText != null && lineText.includes("#")) {

            var matches = lineText.match(/(?<=#).+?(?= |{|\[|:|,|\.|>|\+|~|=|~=|\||=|^=|$=|\*=|\*)/g);
            if(matches != null) {
              matches = [...new Set(matches)]

              for(var j=0; j<matches.length; j++) {
                if(uniqueIds[matches[j]] !== undefined) {

                  var regex = new RegExp("#" + escapeRegExp(matches[j]) + "(?= |{|\\[|:|,|\\.|>|\\+|~|=|~=|\\||=|^=|$=|\\*=|\\*)", "g");
                  lineText = lineText.replace(regex, "#" + uniqueIds[matches[j]]);
                  docCSS.replaceRange(lineText, {line:i, ch:0}, {line:i});
                }
              }

            }
          }

        }

        var updatedTotalLines = editor.lineCount();
        var inStyleMode = false;

        for (var i=0; i<updatedTotalLines; i++) {

          var lineText = doc.getLine(i);

          if (inStyleMode == false && lineText != null && lineText.includes("<style") && lineText.includes(">")) {
            inStyleMode = true;
          }
          else if (inStyleMode == true && lineText != null) {

            if (lineText.includes("#")) {
              var matches = lineText.match(/(?<=#).+?(?= |{|\[|:|,|\.|>|\+|~|=|~=|\||=|^=|$=|\*=|\*)/g);
              if(matches != null) {
                matches = [...new Set(matches)]
                for(var j=0; j<matches.length; j++) {
                  if(uniqueIds[matches[j]] !== undefined) {
                    var regex = new RegExp("#" + escapeRegExp(matches[j]) + "(?= |{|\\[|:|,|\\.|>|\\+|~|=|~=|\\||=|^=|$=|\\*=|\\*)", "g");
                    var lineText = lineText.replace(regex, "#" + uniqueIds[matches[j]]);
                    doc.replaceRange(lineText, {line:i, ch:0}, {line:i});
                  }
                }
              }
            }

            if(lineText.includes("</style>")) {
              inStyleMode = false;
            }
          }
        }

        beautify();



      }

      if (document.getElementById("moveCSS").checked) {

        var updatedTotalLines = editor.lineCount();
        var inStyleMode = false;
        var styleID;
        var startLine;

        for (var i=0; i<updatedTotalLines; i++) {

          var lineText = doc.getLine(i);

          if (inStyleMode == false && lineText != null && lineText.includes("<style") && lineText.includes(">")) {
            var matches = lineText.match(/(?<= id=").+?(?=")/g);
            if(matches != null) {
              styleID = matches[0];
            }
            inStyleMode = true;
            startLine = i;
          }
          else if (inStyleMode == true) {
            if(lineText != null && lineText.includes("</style>")) {
              inStyleMode = false;
              updatePreview();
              docCSS.replaceSelection(document.getElementById('preview').contentWindow.document.getElementById(styleID).textContent);
              doc.replaceRange("", {line:startLine, ch:0}, {line:i});
            }
          }

        }
        beautify();

        var updatedTotalLines = editor.lineCount();
        var styleID;

        for (var i=0; i<updatedTotalLines; i++) {

          var lineText = doc.getLine(i);

          if (lineText != null && !lineText.includes("</") && lineText.includes("<") && lineText.includes(">") && lineText.includes(" style=")) {
            var matches = lineText.match(/(?<= id=").+?(?=")/g);
            if(matches != null) {
              styleID = matches[0];
            }
            updatePreview();
            var element = document.getElementById('preview').contentWindow.document.getElementById(styleID);
            var inlineStyle = element.style.cssText
            element.classList.remove("highlight-element");
            element.removeAttribute("style");
            var elementText = element.outerHTML;
            lineText = elementText.substr(0, elementText.indexOf('>')+1);
            doc.replaceRange(lineText, {line:i, ch:0}, {line:i});
            docCSS.replaceSelection("#" + styleID + " {" + inlineStyle + "}");
          }

        }
        beautify();

      }

      if (document.getElementById("noTagClasses").checked) {

        var updatedTotalLinesCSS = customCSS.lineCount();

        for (var i=0; i<updatedTotalLinesCSS; i++) {

          var lineText = docCSS.getLine(i);

          if (lineText != null) {
            lineText = " " + lineText;

            var contains = containsTags(lineText);

            for(var j=0; j<contains.length; j++) {
              var regex = new RegExp("(?<= |{|\\[|:|,|\\.|>|\\+|~|=|~=|\\||=|^=|$=|\\*=|\\*)" + escapeRegExp(contains[j]) + "(?= |{|\\[|:|,|\\.|>|\\+|~|=|~=|\\||=|^=|$=|\\*=|\\*)", "g");
              lineText = lineText.replace(regex, "." + uniqueTags[contains[j]]);
            }
            docCSS.replaceRange(lineText, {line:i, ch:0}, {line:i});
          }
        }

        var updatedTotalLines = editor.lineCount();
        var inStyleMode = false;

        for (var i=0; i<updatedTotalLines; i++) {

          var lineText = doc.getLine(i);

          if (inStyleMode == false && lineText != null) {
            if(lineText.includes("<style") && lineText.includes(">")) {
              inStyleMode = true;
            } else if(!lineText.includes("</") && lineText.includes("<")) {
              var matches = lineText.match(/(?<=<).+?(?= )/g);
              if(matches != null && uniqueTags[matches[0]] !== undefined) {
                if(lineText.includes(" class=") && !lineText.includes(uniqueTags[matches[0]])) {
                  var index = lineText.indexOf(" class=") + 8;
                  lineText = lineText.slice(0, index) + uniqueTags[matches[0]] + " " + lineText.slice(index);
                  doc.replaceRange(lineText, {line:i, ch:0}, {line:i});
                }
                else if(!lineText.includes(uniqueTags[matches[0]])) {
                  var index = lineText.indexOf("<") + matches[0].length + 1;
                  var classString = ' class="' + uniqueTags[matches[0]] + '"';
                  lineText = lineText.slice(0, index) + classString + lineText.slice(index);
                  doc.replaceRange(lineText, {line:i, ch:0}, {line:i});
                }
              }
            }
          }
          else if (inStyleMode == true && lineText != null) {

            lineText = " " + lineText;
            var contains = containsTags(lineText);

            for(var j=0; j<contains.length; j++) {
              var regex = new RegExp("(?<= |{|\\[|:|,|\\.|>|\\+|~|=|~=|\\||=|^=|$=|\\*=|\\*)" + escapeRegExp(contains[j]) + "(?= |{|\\[|:|,|\\.|>|\\+|~|=|~=|\\||=|^=|$=|\\*=|\\*)", "g");
              lineText = lineText.replace(regex, "." + uniqueTags[contains[j]]);
            }
            docCSS.replaceRange(lineText, {line:i, ch:0}, {line:i});

            if(lineText.includes("</style>")) {
              inStyleMode = false;
            }
          }
        }



      }

      if (document.getElementById("removeUnusedCSS").checked) {
        var css = customCSS.getValue();
        var html = editor.getValue();
        var cleaned = drop(css, html);
        var totalLinesCSS = customCSS.lineCount();
        docCSS.replaceRange(cleaned.css, {line:0, ch:0}, {line:totalLinesCSS});
        beautify();
      }

      if (document.getElementById("renameCSS").checked) {

        var updatedTotalLines = editor.lineCount();

        for (var i=0; i<updatedTotalLines; i++) {

          var newClassLine = "";
          var lineText = doc.getLine(i);

          if (lineText != null && !lineText.includes("<!") && !lineText.includes("</") && lineText.includes("<") && lineText.includes(">") && lineText.includes(' class=')) {
            var matches = lineText.match(/(?<= class=").+?(?=")/g);
            var classesLine = []
            if(matches != null) {
              matches = [...new Set(matches)]
              classesLine = matches[0].split(' ');
              for (var j=0; j<classesLine.length; j++) {
                if(classesLine[j].substring(0,2) == 'sm') {
                  newClassLine = newClassLine + " " + classesLine[j];
                } else {
                  newClassLine = newClassLine + " " + handleNewName(classesLine[j], uniqueClasses);
                }
              }
              lineText = lineText.replace(/class="(.*?)"/g, 'class="' + newClassLine.substring(1) + '"');
              doc.replaceRange(lineText, {line:i, ch:0}, {line:i});
            }
          }

        }


        var updatedTotalLinesCSS = customCSS.lineCount();

        for (var i=0; i<updatedTotalLinesCSS; i++) {

          var lineText = docCSS.getLine(i);

          if (lineText != null && lineText.includes(".")) {
            var matches = lineText.match(/(?<=\.).+?(?= |{|\[|:|,|\.|>|\+|~|=|~=|\||=|^=|$=|\*=|\*)/g);
            if(matches != null) {
              matches = [...new Set(matches)]
              for(var j=0; j<matches.length; j++) {
                if(uniqueClasses[matches[j]] !== undefined) {
                  var regex = new RegExp("\." + escapeRegExp(matches[j]) + "(?= |{|\\[|:|,|\\.|>|\\+|~|=|~=|\\||=|^=|$=|\\*=|\\*)", "g");
                  lineText = lineText.replace(regex, "." + uniqueClasses[matches[j]]);
                  docCSS.replaceRange(lineText, {line:i, ch:0}, {line:i});
                }
              }
            }
          }

        }

        var updatedTotalLines = editor.lineCount();
        var inStyleMode = false;

        for (var i=0; i<updatedTotalLines; i++) {

          var lineText = doc.getLine(i);

          if (inStyleMode == false && lineText != null && lineText.includes("<style") && lineText.includes(">")) {
            inStyleMode = true;
          }
          else if (inStyleMode == true && lineText != null) {

            if (lineText.includes(".")) {
              var matches = lineText.match(/(?<=\.).+?(?= |{|\[|:|,|\.|>|\+|~|=|~=|\||=|^=|$=|\*=|\*)/g);
              if(matches != null) {
                matches = [...new Set(matches)]
                for(var j=0; j<matches.length; j++) {
                  if(uniqueClasses[matches[j]] !== undefined) {
                    var regex = new RegExp("\." + escapeRegExp(matches[j]) + "(?= |{|\\[|:|,|\\.|>|\\+|~|=|~=|\\||=|^=|$=|\\*=|\\*)", "g");
                    lineText = lineText.replace(regex, "." + uniqueClasses[matches[j]]);
                    doc.replaceRange(lineText, {line:i, ch:0}, {line:i});
                  }
                }
              }
            }

            if(lineText.includes("</style>")) {
              inStyleMode = false;
            }
          }
        }

        beautify();



      }

      customCSS.setCursor({line: 0, ch: 0})
    }

    function drop(css, html) {

      /*var whitelist = /body|tbody|html|head/;

      return dropcss({
        css,
        html,
        shouldDrop: (sel) => {
          if (whitelist.test(sel))
              return false;
          else {
              return true;
          }
        },
      });*/

      return dropcss({
        css,
        html,
      });
    }

    function highlightFromEditorTimer() {
      setTimeout(highlightFromEditor, 300);
    }

    function highlightFromEditor() {
      var text = document.getElementById('editorContainer').innerHTML;
      var matches = text.match(/(?<=CodeMirror-matchingtag">id<\/span><span class=" CodeMirror-matchingtag">=<\/span><span class="cm-string CodeMirror-matchingtag">).+?(?=<\/span>)/g);
      if(matches != null) {
        var result = matches[matches.length - 1];
        highlightedID = result.substring(1, result.length-1);
        document.getElementById('preview').contentWindow.highlightNode(document.getElementById('preview').contentWindow.document.getElementById(highlightedID));
      } else {
        highlightedID = null;
        try {
          document.getElementById('preview').contentWindow.highlightNode(document.getElementById('preview').contentWindow.document.getElementById(highlightedID));
        }
        catch(err) {
        }
      }
    }
