 
 
 
 
 


const getNewPathsWhenModalCloses = require('../../../helperFns/getNewPathsWhenModalCloses');


// ['3', '37-1000', '581', '582']
const test1 = ["3", "37-1000", "581", "582", "584"]
const test2 = ['3', '17-3000', '120', '149', '149']

test("Get new paths when modal closes.", () => {
    const test1Result = getNewPathsWhenModalCloses(test1)

    expect(test1Result).toBe("/3/37-1000/581/582/")

    const test2Result = getNewPathsWhenModalCloses(test2)

    expect(test2Result).toBe("/3/17-3000/120/149/")
})
