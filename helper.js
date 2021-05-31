function getOffset(currentPage = 1, listPerPage) {
    return (currentPage - 1) * [listPerPage];
  }
  
  function emptyOrRows(rows) {
    if (!rows) {
      return [];
    }
    return rows;
  }
  
  function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
  
    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      req.token = bearerToken;
      console.log(req.token);
      if(req.token === token){
        next();
      }else{
        res.sendStatus(403);
      }
      
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  }

  module.exports = {
    getOffset,
    emptyOrRows,
    verifyToken
  }