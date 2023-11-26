import { read, utils } from "xlsx"
/**
 * 读取并处理Excel
 * @param {file} file  需要读取的excel表格文件
 * @param {Array} tableHead 表头数据的存储地址，传入一个array
 * @param {Array} tableData 表格数据的存储地址，传入一个array, 一般来说这里面的就是我们需要的数据, 记得用计时器延迟获取数据, 不然拿不到
 * @returns 
 */
export const readExcel = (file, tableHead=[], tableData) => {
    return new Promise((resolve, reject) => {
            const fileReader = new FileReader()
            fileReader.onload = (event) => {
                try {
                    const fileData = event.target.result
                    const workbook = read(fileData, { type: 'binary' })
                    const params = []
    
                    workbook.SheetNames.forEach((ever) => {
                        params.push({
                            name: ever,
                            dataList: utils.sheet_to_json(workbook.Sheets[ever])
                        })
                        tableData.push(utils.sheet_to_json(workbook.Sheets[ever]))
                    })
                    if(tableData.length > 0){
                        for(let key in tableData[0][0]){
                            tableHead.push(key)
                        }
                    }
                    resolve(params)
                    return params  
                }catch (err) {
                    console.log('fileError: ', err)
                    reject(err)
                }
            }
            fileReader.readAsBinaryString(file)
    })
}