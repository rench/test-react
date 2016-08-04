import React, {Component, PropTypes} from 'react';
import ReactDOM, {render} from 'react-dom';

/**
 * 转化数据
 * 
 * @param {Object} data
 * @returns String
 */
function formData(data) {
    var arr = [];
    for (let key in data) {
        arr.push(`${key}=${data[key]}`);
    }
    return arr.join('&');
}

export default class App extends Component {
    render() {
        return (
            <div>
                <div className="search" data-flex="main:center">
                    <div>
                        <input type="text" placeholder="支持全属性匹配搜索" onChange={this.searchName} />
                    </div>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>id</th>
                            <th>头像</th>
                            <th>名字</th>
                            <th>
                                年龄
                                <a href="javasctipt:;">↑</a>
                                <a href="javasctipt:;">↓</a>
                            </th>
                            <th>电话</th>
                            <th>签名</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.list.map((item) => {
                                return <List item={item} key={item.id} editItem={this.editItem} updataItem={this.updataItem} delItem={this.delItem} />
                            })
                        }
                    </tbody>
                </table>
                <div data-flex="main:center">
                    <button className="adddata" onClick={this.addItem}>添加数据</button>
                </div>
            </div>
        )
    }
    constructor(props) {
        super(props);
        this.state = {
            list: [] //列表的数据
        };

        /**
         * 查询姓名
         */
        this.searchName = (e) => {
            var name = e.target.value;
            var {list} = this.state;
            list.map((item) => {

                for (let key in item) {
                    if (Boolean(new RegExp(name).exec(item[key] + ''))) {
                        return item.display = ''; //有一个属性匹配上，则显示
                    }
                }

                item.display = 'none';
            });
            this.setState({ list });
        }

        /**
         * 编辑项目
         * 
         * @param {Object} data
         * @returns
         */
        this.editItem = (data) => {
            var {list} = this.state;

            for (let i = 0; i < list.length; i++) {
                if (list[i].id == data.id) {
                    let {editState = true} = list[i];
                    list[i].editState = !editState;
                    return this.setState({ list });
                }
            }
        }

        /**
         * 更新数据
         * 
         * @param {Object} data
         * @returns
         */
        this.updataItem = (data) => {
            var {list} = this.state;
            /** 省略若干表单验证处理  */
            for (let i = 0; i < list.length; i++) {
                if (list[i].id == data.id) {
                    list[i] = data;
                    break;
                }
            }
            this.setState({ list });
            //注意：如果 id < 0 后台应该是新增
            fetch(`/api/edit/${data.id}`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData(data)
            }).then((res) => {
                return res.json();
            }).then((res) => {
                alert(res.msg); //更新成功
                if (res.data) {
                    data.id = res.data.id;
                    this.setState({ list });
                }

            }).catch((e) => {
                alert('更新失败');
            });
        }

        /**
         * 删除项目
         * 
         * @param {Object} data
         * @returns
         */
        this.delItem = (data) => {
            var {list} = this.state;
            for (let i = 0; i < list.length; i++) {
                if (list[i].id == data.id) {
                    list.splice(i, 1);
                    break;
                }
            }
            this.setState({ list });
            if (data.id > 0) {
                fetch(`/api/del/${data.id}`)
                    .then((res) => {
                        return res.json();
                    })
                    .then((res) => {
                        alert(res.msg); //删除成功
                    })
                    .catch((e) => {
                        alert('删除失败');
                    });
            }

        }
        var aid = 0;
        /**
         * 添加项目
         */
        this.addItem = () => {
            var {list} = this.state;

            list.push({
                id: --aid, //添加时，必须保证唯一id，否则会报错，等用户保存时，如果id < 0 则需要向服务器发送请求保存，保存成功后，服务器返回id后将id再更新
                image: 'http://localhost:3000/images/4.jpg',
                name: '',
                age: 18,
                phone: '',
                phrase: '',
                display: '',
                editState: false
            });
            this.setState({ list });
        }

    }
    componentDidMount() {
        //从服务器拉取数据
        fetch('/api/list')
            .then((res) => {
                return res.json();
            })
            .then((list) => {
                this.setState({ list });
            })
            .catch((e) => {
                alert('加载失败，请稍后重试！');
            });

    }
}

class List extends Component {
    render() {
        var {id, image, name, age, phone, phrase, display, editState = true} = this.props.item;
        var btnname = editState ? '修改' : '保存';
        return (
            <tr style={{ display }}>
                <td>{id > 0 ? id : ''}</td>
                <td>
                    <img className="headeimg" src={image} alt=""/>
                </td>
                <td>
                    <input type="text" disabled={editState} ref="name" defaultValue={name} />
                </td>
                <td><input type="number" disabled={editState} ref="age" defaultValue={age} /></td>
                <td><input type="tel" disabled={editState} ref="phone" defaultValue={phone} /></td>
                <td>
                    <textarea disabled={editState} ref="phrase" defaultValue={phrase}></textarea>
                </td>
                <td>
                    <button onClick={this.editItem}>{btnname}</button>
                    <button onClick={() => this.props.delItem(this.props.item) }>删除</button>
                </td>
            </tr>
        )
    }
    constructor(props) {
        super(props);

        this.editItem = () => {
            var {id, image, editState = true, editItem} = this.props.item;
            if (editState) {
                this.props.editItem(this.props.item);
            } else {
                let name = this.refs.name.value;
                let age = parseInt(this.refs.age.value);
                let phone = this.refs.phone.value;
                let phrase = this.refs.phrase.value;
                console.log(age);
                if (!name) {
                    return alert('姓名不能为空');
                } else if (!age || age < 0) {
                    return alert('年龄不合法');
                } else if (!phone) {
                    return alert('手机号码不能为空');
                }

                this.props.updataItem({ id, image, name, age, phone, phrase, editState: true });
            }
        }

    }
}