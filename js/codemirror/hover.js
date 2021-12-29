



var rootNode = document.documentElement;
var currentNode = currentNode || {};
var lastNode = lastNode || {};
var nodeClone = nodeClone || {};
var prevOnClick = prevOnClick || {};

function highlightNode(currentNode) {

    if (currentNode === rootNode || currentNode === document.body){
        // If current node is HTML or BODY, do nothing

    } else {

        if (currentNode === lastNode) {
            // If still on same node, do nothing
            // console.log('Same node');

        } else {
            // console.log('Different node');

            // if lastNode has classList, check for onclick attribute and remove highlight-element class
            if (lastNode != null && lastNode.classList) {

                // If lastNode had onclick attribute, replace with the untouched value from nodeClone
                if (lastNode.getAttribute("onclick") != null) {
                    prevOnClick = nodeClone.getAttribute("onclick");
                    lastNode.setAttribute("onclick", prevOnClick);
                }

                lastNode.classList.remove('highlight-element');
            }

            // Save currentNode and preserve any inline event (onclick) attributes
            if(currentNode != null) {
              nodeClone = currentNode.cloneNode();


              // if currentNode has onclick attribute, disable it
              if (currentNode.getAttribute("onclick")) {
                  currentNode.setAttribute("onclick", "return false;");
              };

              // Add highlight class to currentNode
              currentNode.classList.add('highlight-element');
            }
        }

        // store node
        lastNode = currentNode;
    }

}

function clickHandler (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var x = e.clientX;
    var y = e.clientY;
    currentNode = document.elementFromPoint(x, y);

    parent.highlightFromPreview(currentNode);
}

function cancelNodeSelect (e) {
    if (e.keyCode == 27) {
        // if lastNode has classList, check for onclick attribute and remove highlight-element class
        if (lastNode.classList) {

            if (lastNode.getAttribute("onclick") != null) {
                prevOnClick = nodeClone.getAttribute("onclick");
                lastNode.setAttribute("onclick", prevOnClick);
            }

            lastNode.classList.remove('highlight-element');
        }

        // remove event listeners
        document.removeEventListener('click', clickHandler, false);
        //document.removeEventListener('mousemove', nodeHandler, false);
        //document.removeEventListener('keyup', cancelNodeSelect, false);
    };
}

//document.addEventListener('click', clickHandler, false);
//document.addEventListener('mousemove', nodeHandler, false);
//document.addEventListener('keyup', cancelNodeSelect, false);
